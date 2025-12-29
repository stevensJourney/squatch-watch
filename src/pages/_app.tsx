import { DynamicPowerSyncProvider } from '@/services/DynamicPowerSyncProvider';
import '@/styles/globals.css';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <DynamicPowerSyncProvider>
      <Component {...pageProps} />
    </DynamicPowerSyncProvider>
  );
}
