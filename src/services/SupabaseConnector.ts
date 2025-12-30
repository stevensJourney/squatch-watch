// Not using `type` causes issues in SSR mode.
import type { AbstractPowerSyncDatabase, PowerSyncBackendConnector } from '@powersync/web';
import { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';

const POWERSYNC_URL = process.env.NEXT_PUBLIC_POWERSYNC_URL || '';

/// Postgres Response codes that we cannot recover from by retrying.
const FATAL_RESPONSE_CODES = [
  // Class 22 — Data Exception
  // Examples include data type mismatch.
  new RegExp('^22...$'),
  // Class 23 — Integrity Constraint Violation.
  // Examples include NOT NULL, FOREIGN KEY and UNIQUE violations.
  new RegExp('^23...$'),
  // INSUFFICIENT PRIVILEGE - typically a row-level security violation
  new RegExp('^42501$')
];

export class SupabaseConnector implements PowerSyncBackendConnector {
  private _session: Session | null = null;
  private _initialized = false;

  /**
   * Current session (available synchronously after initialization)
   */
  get session(): Session | null {
    return this._session;
  }

  /**
   * Whether the connector has been initialized
   */
  get isInitialized(): boolean {
    return this._initialized;
  }

  /**
   * Current user ID (available synchronously after initialization)
   */
  get currentUserId(): string | null {
    return this._session?.user?.id || null;
  }

  /**
   * Check if a session exists without signing in.
   * Returns true if there's an existing session.
   */
  async hasExistingSession(): Promise<boolean> {
    const {
      data: { session }
    } = await supabase.auth.getSession();

    if (session) {
      this._session = session;
      this._initialized = true;
      return true;
    }

    return false;
  }

  /**
   * Sign in with email and password
   */
  async signInWithEmail(email: string, password: string): Promise<void> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      throw error;
    }

    if (!data.session) {
      throw new Error('Failed to sign in');
    }

    this._session = data.session;
    this._initialized = true;

    // Listen for auth state changes
    supabase.auth.onAuthStateChange((_event, session) => {
      this._session = session;
    });
  }

  /**
   * Sign up with email and password
   */
  async signUpWithEmail(email: string, password: string): Promise<void> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) {
      throw error;
    }

    // Note: User may need to verify email before session is available
    if (data.session) {
      this._session = data.session;
      this._initialized = true;

      // Listen for auth state changes
      supabase.auth.onAuthStateChange((_event, session) => {
        this._session = session;
      });
    }
  }

  /**
   * Sign in anonymously
   */
  async signInAnonymously(): Promise<void> {
    const { data, error } = await supabase.auth.signInAnonymously();

    if (error) {
      throw error;
    }

    if (!data.session) {
      throw new Error('Failed to create anonymous session');
    }

    this._session = data.session;
    this._initialized = true;

    // Listen for auth state changes
    supabase.auth.onAuthStateChange((_event, session) => {
      this._session = session;
    });
  }

  /**
   * Sign out the current user
   */
  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
    this._session = null;
    this._initialized = false;
  }

  /**
   * Initialize the connector - checks for existing session and sets up auth listener.
   * Does not automatically sign in - call signInWithEmail, signUpWithEmail, or signInAnonymously separately.
   */
  async init(): Promise<void> {
    if (this._initialized) return;

    // Check for existing session
    await this.hasExistingSession();

    this._initialized = true;

    // Listen for auth state changes
    supabase.auth.onAuthStateChange((_event, session) => {
      this._session = session;
    });
  }

  async fetchCredentials() {
    if (!this._session) {
      throw new Error('No session available - sign in first');
    }

    return {
      endpoint: POWERSYNC_URL,
      token: this._session.access_token,
      expiresAt: this._session.expires_at ? new Date(this._session.expires_at * 1000) : undefined
    };
  }

  async uploadData(database: AbstractPowerSyncDatabase): Promise<void> {
    const transaction = await database.getNextCrudTransaction();

    if (!transaction) {
      return;
    }

    // Get current user ID to patch into records
    const currentUserId = this.currentUserId;

    // If no session, throw to retry later when user signs in
    if (!currentUserId) {
      throw new Error('No session - cannot upload. Sign in to sync data.');
    }

    try {
      // Note: If transactional consistency is important, use database functions
      // or edge functions to process the entire transaction in a single call.
      for (const op of transaction.crud) {
        const table = supabase.from(op.table);
        let result: { error: { message: string; code?: string } | null };

        switch (op.op) {
          case 'PUT':
            // Patch in the current user ID if the record has a user_id field
            const record: Record<string, unknown> = { ...op.opData, id: op.id };
            if ('user_id' in record || op.table === 'sightings') {
              record.user_id = currentUserId;
            }
            result = await table.upsert(record);
            break;
          case 'PATCH':
            // Patch in the current user ID for updates as well
            const updateData: Record<string, unknown> = { ...op.opData };
            if ('user_id' in updateData || op.table === 'sightings') {
              updateData.user_id = currentUserId;
            }
            result = await table.update(updateData).eq('id', op.id);
            break;
          case 'DELETE':
            result = await table.delete().eq('id', op.id);
            break;
          default:
            continue;
        }

        if (result.error) {
          result.error.message = `Could not update Supabase. Received error: ${result.error.message}`;
          throw result.error;
        }
      }

      await transaction.complete();
    } catch (ex: unknown) {
      const error = ex as { code?: string; message?: string };
      if (typeof error.code === 'string' && FATAL_RESPONSE_CODES.some((regex) => regex.test(error.code!))) {
        /**
         * Instead of blocking the queue with these errors,
         * discard the (rest of the) transaction.
         *
         * Note that these errors typically indicate a bug in the application.
         * If protecting against data loss is important, save the failing records
         * elsewhere instead of discarding, and/or notify the user.
         */
        await transaction.complete();
      } else {
        // Error may be retryable - e.g. network error or temporary server error.
        // Throwing an error here causes this call to be retried after a delay.
        throw ex;
      }
    }
  }

  /**
   * Get the current user ID from the Supabase session
   */
  async getUserId(): Promise<string | null> {
    if (this._session) {
      return this._session.user?.id || null;
    }
    const {
      data: { session }
    } = await supabase.auth.getSession();
    return session?.user?.id || null;
  }
}

// Export a singleton instance
export const supabaseConnector = new SupabaseConnector();
