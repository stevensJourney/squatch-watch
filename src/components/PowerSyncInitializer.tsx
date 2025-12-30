import { BigfootIcon } from '@/components/BigfootIcon';
import RefreshIcon from '@mui/icons-material/Refresh';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { Alert, Box, Button, Card, CardContent, Typography } from '@mui/material';
import { usePowerSync } from '@powersync/react';
import { useEffect, useState } from 'react';

type InitState = 'initializing' | 'ready' | 'error';

interface ErrorDetails {
  message: string;
  stack?: string;
  name?: string;
  raw: string;
}

interface PowerSyncInitializerProps {
  children: React.ReactNode;
}

/**
 * PowerSyncInitializer handles initializing the local database.
 * Authentication and connection to backend is handled by the sign-in page.
 */
export const PowerSyncInitializer = ({ children }: PowerSyncInitializerProps) => {
  const powerSync = usePowerSync();
  const [state, setState] = useState<InitState>('initializing');
  const [error, setError] = useState<ErrorDetails | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        // Just ensure the database is ready
        // Connection to backend is handled elsewhere (index page)
        await powerSync.init();
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

  if (state === 'initializing') {
    // Brief initialization - don't show loading screen
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
              We couldn&apos;t initialize the local database.
              <br />
              This is needed to track Bigfoot sightings.
            </Typography>

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
