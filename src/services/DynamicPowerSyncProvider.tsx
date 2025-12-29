import dynamic from 'next/dynamic';

/**
 * Only load PowerSync on the client side.
 * Required because @powersync/web uses browser-only APIs.
 */
export const DynamicPowerSyncProvider = dynamic(() => import('./PowerSyncProvider'), {
  ssr: false
});

