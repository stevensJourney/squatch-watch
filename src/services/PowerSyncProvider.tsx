import { PowerSyncContext } from '@powersync/react';
import { PowerSyncDatabase, Schema, Table, WASQLiteOpenFactory, column } from '@powersync/web';
import { useEffect, useState } from 'react';

const SCHEMA = new Schema({
  sighting: new Table({
    date: column.text,
    comments: column.text
  })
});

export const PowerSyncProvider = ({ children }: { children: React.ReactNode }) => {
  const [powerSync] = useState(
    () =>
      new PowerSyncDatabase({
        schema: SCHEMA,
        database: new WASQLiteOpenFactory({
          dbFilename: 'powersync-demo.db',
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
      })
  );
  useEffect(() => {
    return () => {
      powerSync.close();
    };
  }, [powerSync]);
  return <PowerSyncContext.Provider value={powerSync}>{children}</PowerSyncContext.Provider>;
};

export default PowerSyncProvider;
