import { LoadingScreen } from '@/components/LoadingScreen';
import { supabaseConnector } from '@/services/SupabaseConnector';
import { usePowerSync } from '@powersync/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

interface SessionGuardProps {
  children: React.ReactNode;
  /**
   * If true, redirects to sign-in page when no session exists.
   * If false, allows local-only mode without a session.
   * Default: false
   */
  requireSession?: boolean;
}

/**
 * SessionGuard checks for an existing Supabase session on mount/refresh
 * and reconnects PowerSync if a session is found.
 *
 * Use this on pages that should restore a session after a page refresh.
 */
export const SessionGuard = ({ children, requireSession = false }: SessionGuardProps) => {
  const powerSync = usePowerSync();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAndReconnect = async () => {
      // Skip if PowerSync is already connected
      if (powerSync.connected || powerSync.currentStatus.connecting) {
        setIsLoading(false);
        return;
      }

      try {
        // Check for existing Supabase session
        const hasSession = await supabaseConnector.hasExistingSession();

        if (hasSession) {
          // Reconnect PowerSync with the existing session
          powerSync.connect(supabaseConnector);
        } else if (requireSession) {
          // No session and session is required - redirect to sign in
          router.push('/');
          return;
        }
      } catch (err) {
        console.warn('SessionGuard: Error checking session:', err);
        if (requireSession) {
          router.push('/');
          return;
        }
      }

      setIsLoading(false);
    };

    checkAndReconnect();
  }, [powerSync, router, requireSession]);

  if (isLoading) {
    return <LoadingScreen message="Checking the trail..." submessage="Looking for existing tracks" />;
  }

  return <>{children}</>;
};

export default SessionGuard;
