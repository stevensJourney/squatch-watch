import dynamic from 'next/dynamic';

/**
 * Only use PowerSync in client side rendering
 */
export const DynamicPowerSyncProvider = dynamic(() => import('./PowerSyncProvider'), {
  ssr: false
});
