import { PowerSyncInitializer } from '@/components/PowerSyncInitializer';
import { Capacitor } from '@capacitor/core';
import { CapacitorSQLiteOpenFactory, PowerSyncDatabase } from '@powersync/capacitor';
import { PowerSyncContext } from '@powersync/react';
import { AttachmentTable, Schema, Table, WASQLiteOpenFactory, column } from '@powersync/web';
import { AttachmentQueueProvider } from './AttachmentQueueProvider';
import { supabaseConnector } from './SupabaseConnector';
import { SupabaseConnectorProvider } from './SupabaseConnectorProvider';

const SCHEMA = new Schema({
  sightings: new Table({
    date: column.text,
    comments: column.text,
    user_id: column.text,
    photo_id: column.text
  }),
  // Local-only table for tracking attachment sync state
  attachments: new AttachmentTable()
});

const isWeb = !Capacitor.isNativePlatform();

const powerSync = new PowerSyncDatabase({
  schema: SCHEMA,
  database: isWeb
    ? new WASQLiteOpenFactory({
        dbFilename: 'powersync-capacitor-nextjs.db',
        /**
         * The default worker does not seem to be bundled correctly with Next.js and Turborepo.
         * This is a bundled version copied from the @powersync/web package.
         * Using:
         * ```bash
         * powersync-web copy-assets public
         * ```
         */
        worker: '/@powersync/worker/WASQLiteDB.umd.js'
      })
    : new CapacitorSQLiteOpenFactory({
        dbFilename: 'powersync-capacitor-nextjs.db'
      }),
  ...(isWeb && {
    sync: {
      worker: '/@powersync/worker/SharedSyncImplementation.umd.js'
    }
  })
});

export const PowerSyncProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <SupabaseConnectorProvider connector={supabaseConnector}>
      <PowerSyncContext.Provider value={powerSync}>
        <PowerSyncInitializer>
          <AttachmentQueueProvider>{children}</AttachmentQueueProvider>
        </PowerSyncInitializer>
      </PowerSyncContext.Provider>
    </SupabaseConnectorProvider>
  );
};

export default PowerSyncProvider;
