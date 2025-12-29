import { DynamicPowerSyncProvider } from '@/services/DynamicPowerSyncProvider';
import '@/styles/globals.css';
import theme from '@/styles/theme';
import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DynamicPowerSyncProvider>
        <Component {...pageProps} />
      </DynamicPowerSyncProvider>
    </ThemeProvider>
  );
}
