import { BigfootIcon } from '@/components/BigfootIcon';
import { LoadingScreen } from '@/components/LoadingScreen';
import { supabaseConnector } from '@/services/SupabaseConnector';
import RefreshIcon from '@mui/icons-material/Refresh';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { Alert, Box, Button, Card, CardContent, Chip, Typography } from '@mui/material';
import { usePowerSync } from '@powersync/react';
import { useEffect, useState } from 'react';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';

type InitState = 'checking' | 'signing-in' | 'ready' | 'error';

interface ErrorDetails {
  message: string;
  stack?: string;
  name?: string;
  raw: string;
}

interface PowerSyncInitializerProps {
  children: React.ReactNode;
}

export const PowerSyncInitializer = ({ children }: PowerSyncInitializerProps) => {
  const powerSync = usePowerSync();
  // Start with 'checking' - we'll quickly determine if a session exists
  const [state, setState] = useState<InitState>('checking');
  const [error, setError] = useState<ErrorDetails | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        // First, check if we have an existing session (fast path)
        const hasSession = await supabaseConnector.hasExistingSession();

        if (!hasSession) {
          // No existing session - need to sign in anonymously
          setState('signing-in');
          await supabaseConnector.init();
        }

        // Connect to PowerSync (don't await - let it connect in background)
        powerSync.connect(supabaseConnector);
        setState('ready');
      } catch (err) {
        const errorDetails: ErrorDetails = {
          message: err instanceof Error ? err.message : String(err),
          stack: err instanceof Error ? err.stack : undefined,
          name: err instanceof Error ? err.name : undefined,
          raw: JSON.stringify(err, Object.getOwnPropertyNames(err), 2)
        };
        setError(errorDetails);
        setState('error');
      }
    };

    init();
  }, [powerSync]);

  // Only show loading screen during sign-in (not for quick session check)
  if (state === 'signing-in') {
    return <LoadingScreen message="Entering the forest..." submessage="Creating anonymous tracker session" />;
  }

  if (state === 'checking') {
    // Brief check - don't show loading, just render nothing or a minimal placeholder
    return null;
  }

  if (state === 'error') {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(180deg, #1a2f1a 0%, #0d1a0d 50%, #0a1408 100%)',
          p: 3
        }}>
        <Card
          sx={{
            maxWidth: 600,
            width: '100%',
            background: 'rgba(22, 34, 22, 0.95)',
            border: '1px solid rgba(139, 69, 19, 0.4)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
          }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <WarningAmberIcon sx={{ color: '#CD853F', fontSize: 40 }} />
              <Typography variant="h5" sx={{ color: '#DEB887', fontWeight: 600 }}>
                Lost in the Woods! 🌲
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
              <BigfootIcon size={60} />
            </Box>

            <Typography variant="body1" sx={{ color: 'rgba(222, 184, 135, 0.9)', mb: 2, textAlign: 'center' }}>
              We couldn&apos;t establish a connection to track Bigfoot sightings.
              <br />
              The anonymous sign-in via Supabase Auth failed.
            </Typography>

            <Box sx={{ mb: 2, textAlign: 'center' }}>
              <Chip
                label={SUPABASE_URL || 'No Supabase URL configured'}
                size="small"
                sx={{
                  background: 'rgba(139, 69, 19, 0.2)',
                  color: 'rgba(222, 184, 135, 0.8)',
                  fontFamily: 'monospace',
                  fontSize: '11px',
                  border: '1px solid rgba(139, 69, 19, 0.3)'
                }}
              />
            </Box>

            <Alert
              severity="error"
              sx={{
                mb: 2,
                background: 'rgba(139, 69, 19, 0.15)',
                border: '1px solid rgba(139, 69, 19, 0.3)',
                '& .MuiAlert-icon': {
                  color: '#CD853F'
                }
              }}>
              {error?.message}
            </Alert>

            {error?.name && (
              <Typography variant="body2" sx={{ color: 'rgba(222, 184, 135, 0.7)', mb: 1 }}>
                <strong>Error Type:</strong> {error.name}
              </Typography>
            )}

            <Typography variant="body2" sx={{ color: 'rgba(143, 188, 143, 0.5)', mb: 1 }}>
              Full Error Details (for the technically inclined cryptid hunters):
            </Typography>

            <Box
              component="pre"
              sx={{
                background: 'rgba(0,0,0,0.4)',
                p: 2,
                borderRadius: 1,
                overflow: 'auto',
                maxHeight: 200,
                fontSize: '11px',
                color: '#DEB887',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                border: '1px solid rgba(139, 69, 19, 0.2)'
              }}>
              {error?.raw}
            </Box>

            {error?.stack && (
              <>
                <Typography variant="body2" sx={{ color: 'rgba(143, 188, 143, 0.5)', mt: 2, mb: 1 }}>
                  Stack Trace:
                </Typography>
                <Box
                  component="pre"
                  sx={{
                    background: 'rgba(0,0,0,0.4)',
                    p: 2,
                    borderRadius: 1,
                    overflow: 'auto',
                    maxHeight: 150,
                    fontSize: '10px',
                    color: 'rgba(222, 184, 135, 0.6)',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    border: '1px solid rgba(139, 69, 19, 0.2)'
                  }}>
                  {error.stack}
                </Box>
              </>
            )}

            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={() => window.location.reload()}
              fullWidth
              sx={{
                mt: 3,
                background: 'linear-gradient(135deg, #228B22 0%, #006400 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #32CD32 0%, #228B22 100%)'
                }
              }}>
              Try Again 🦶
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return <>{children}</>;
};

export default PowerSyncInitializer;
