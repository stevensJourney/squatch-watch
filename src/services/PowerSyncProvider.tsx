import { PowerSyncInitializer } from '@/components/PowerSyncInitializer';
import { PowerSyncContext } from '@powersync/react';
import { PowerSyncDatabase, Schema, Table, WASQLiteOpenFactory, column } from '@powersync/web';
import { useState } from 'react';
import { supabaseConnector } from './SupabaseConnector';
import { SupabaseConnectorProvider } from './SupabaseConnectorProvider';

const SCHEMA = new Schema({
  sightings: new Table({
    date: column.text,
    comments: column.text,
    user_id: column.text
  })
});

export const PowerSyncProvider = ({ children }: { children: React.ReactNode }) => {
  const [powerSync] = useState(
    () =>
      new PowerSyncDatabase({
        schema: SCHEMA,
        database: new WASQLiteOpenFactory({
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
        }),
        sync: {
          worker: '/@powersync/worker/SharedSyncImplementation.umd.js'
        }
      })
  );
  return (
    <SupabaseConnectorProvider connector={supabaseConnector}>
      <PowerSyncContext.Provider value={powerSync}>
        <PowerSyncInitializer>{children}</PowerSyncInitializer>
      </PowerSyncContext.Provider>
    </SupabaseConnectorProvider>
  );
};

export default PowerSyncProvider;
