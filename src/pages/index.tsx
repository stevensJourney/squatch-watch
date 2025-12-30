import { BigfootIcon } from '@/components/BigfootIcon';
import { HidingBigfoot } from '@/components/HidingBigfoot';
import { LoadingScreen } from '@/components/LoadingScreen';
import { supabaseConnector } from '@/services/SupabaseConnector';
import EmailIcon from '@mui/icons-material/Email';
import ForestIcon from '@mui/icons-material/Forest';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  IconButton,
  InputAdornment,
  Tab,
  Tabs,
  TextField,
  Typography
} from '@mui/material';
import { usePowerSync } from '@powersync/react';
import { useFormik } from 'formik';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

type AuthMode = 'signin' | 'register';

export default function SignInPage() {
  const router = useRouter();
  const powerSync = usePowerSync();
  const [checkingSession, setCheckingSession] = useState(true);
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const hasSession = await supabaseConnector.hasExistingSession();
        if (hasSession) {
          // Connect PowerSync and navigate to sightings
          powerSync.connect(supabaseConnector);
          router.push('/sightings');
          return;
        }
      } catch (err) {
        console.warn('Error checking session:', err);
      }
      setCheckingSession(false);
    };

    checkSession();
  }, [powerSync, router]);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: ''
    },
    validate: (values) => {
      const errors: { email?: string; password?: string } = {};
      if (!values.email) {
        errors.email = 'Email is required';
      } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
        errors.email = 'Invalid email address';
      }
      if (!values.password) {
        errors.password = 'Password is required';
      } else if (values.password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
      }
      return errors;
    },
    onSubmit: async (values, { resetForm }) => {
      setLoading(true);
      setError(null);
      setSuccess(null);

      try {
        if (authMode === 'register') {
          await supabaseConnector.signUpWithEmail(values.email, values.password);
          setSuccess('Account created! Check your email to verify your account.');
          resetForm();
        } else {
          await supabaseConnector.signInWithEmail(values.email, values.password);
          // Connect PowerSync and navigate
          powerSync.connect(supabaseConnector);
          router.push('/sightings');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Authentication failed');
      } finally {
        setLoading(false);
      }
    }
  });

  const handleAnonymousSignIn = async () => {
    setLoading(true);
    setError(null);

    try {
      await supabaseConnector.signInAnonymously();
      powerSync.connect(supabaseConnector);
      router.push('/sightings');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Anonymous sign-in failed');
      setLoading(false);
    }
  };

  const handleLocalOnly = () => {
    // Navigate to sightings without signing in - data stored locally with null user_id
    router.push('/sightings');
  };

  if (checkingSession) {
    return <LoadingScreen message="Checking the trail..." submessage="Looking for existing tracks" />;
  }

  return (
    <>
      <Head>
        <title>Squatch Watch | Sign In</title>
        <meta name="description" content="Sign in to track Bigfoot sightings" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(180deg, #1a2f1a 0%, #0d1a0d 50%, #0a1408 100%)',
          py: 4,
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23228B22' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            pointerEvents: 'none'
          }
        }}>
        <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
          {/* Header */}
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <BigfootIcon size={80} />
            </Box>
            <Typography
              variant="h3"
              sx={{
                color: '#8FBC8F',
                fontWeight: 800,
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                letterSpacing: '-0.02em'
              }}>
              SQUATCH WATCH
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: '#6B8E23',
                fontWeight: 400,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1
              }}>
              <ForestIcon fontSize="small" />
              Bigfoot Sighting Tracker
              <ForestIcon fontSize="small" />
            </Typography>
          </Box>

          {/* Sign In Card */}
          <Card
            sx={{
              background: 'rgba(22, 34, 22, 0.95)',
              border: '1px solid rgba(34, 139, 34, 0.3)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
            }}>
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h5"
                sx={{
                  color: '#8FBC8F',
                  fontWeight: 600,
                  textAlign: 'center',
                  mb: 2
                }}>
                Join the Hunt 🦶
              </Typography>

              {/* Email/Password Auth */}
              <Tabs
                value={authMode}
                onChange={(_, value) => {
                  setAuthMode(value);
                  setError(null);
                  setSuccess(null);
                }}
                variant="fullWidth"
                sx={{
                  mb: 3,
                  '& .MuiTab-root': {
                    color: 'rgba(143, 188, 143, 0.6)',
                    '&.Mui-selected': {
                      color: '#8FBC8F'
                    }
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: '#228B22'
                  }
                }}>
                <Tab value="signin" label="Sign In" />
                <Tab value="register" label="Register" />
              </Tabs>

              {error && (
                <Alert
                  severity="error"
                  sx={{
                    mb: 2,
                    background: 'rgba(139, 69, 19, 0.15)',
                    border: '1px solid rgba(205, 92, 92, 0.3)',
                    color: '#E57373'
                  }}>
                  {error}
                </Alert>
              )}

              {success && (
                <Alert
                  severity="success"
                  sx={{
                    mb: 2,
                    background: 'rgba(34, 139, 34, 0.15)',
                    border: '1px solid rgba(34, 139, 34, 0.3)',
                    color: '#81C784'
                  }}>
                  {success}
                </Alert>
              )}

              <form onSubmit={formik.handleSubmit}>
                <TextField
                  fullWidth
                  name="email"
                  label="Email"
                  type="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'rgba(34, 139, 34, 0.3)' },
                      '&:hover fieldset': { borderColor: '#228B22' },
                      '&.Mui-focused fieldset': { borderColor: '#32CD32' }
                    },
                    '& .MuiInputLabel-root': { color: 'rgba(143, 188, 143, 0.7)' },
                    '& .MuiInputBase-input': { color: '#C8E6C9' }
                  }}
                />

                <TextField
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  helperText={formik.touched.password && formik.errors.password}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          sx={{ color: 'rgba(143, 188, 143, 0.5)' }}>
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: 'rgba(34, 139, 34, 0.3)' },
                      '&:hover fieldset': { borderColor: '#228B22' },
                      '&.Mui-focused fieldset': { borderColor: '#32CD32' }
                    },
                    '& .MuiInputLabel-root': { color: 'rgba(143, 188, 143, 0.7)' },
                    '& .MuiInputBase-input': { color: '#C8E6C9' }
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  startIcon={<EmailIcon />}
                  sx={{
                    py: 1.5,
                    background: 'linear-gradient(135deg, #228B22 0%, #006400 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #32CD32 0%, #228B22 100%)'
                    }
                  }}>
                  {loading ? 'Please wait...' : authMode === 'register' ? 'Create Account' : 'Sign In'}
                </Button>
              </form>

              <Divider sx={{ my: 3, borderColor: 'rgba(34, 139, 34, 0.2)' }}>
                <Typography variant="body2" sx={{ color: 'rgba(143, 188, 143, 0.5)', px: 1 }}>
                  or
                </Typography>
              </Divider>

              {/* Alternative Options */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  disabled={loading}
                  onClick={handleAnonymousSignIn}
                  startIcon={<PersonOffIcon />}
                  sx={{
                    py: 1.5,
                    borderColor: 'rgba(34, 139, 34, 0.4)',
                    color: '#8FBC8F',
                    '&:hover': {
                      borderColor: '#228B22',
                      background: 'rgba(34, 139, 34, 0.1)'
                    }
                  }}>
                  Continue Anonymously
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  disabled={loading}
                  onClick={handleLocalOnly}
                  sx={{
                    py: 1.5,
                    borderColor: 'rgba(139, 69, 19, 0.4)',
                    color: '#DEB887',
                    '&:hover': {
                      borderColor: '#8B4513',
                      background: 'rgba(139, 69, 19, 0.1)'
                    }
                  }}>
                  📱 Local Only (No Sync)
                </Button>
              </Box>

              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  textAlign: 'center',
                  color: 'rgba(143, 188, 143, 0.4)',
                  mt: 3
                }}>
                🔒 Your sightings sync securely with PowerSync
              </Typography>
            </CardContent>
          </Card>

          {/* Info Cards */}
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Card
              sx={{
                flex: 1,
                background: 'rgba(22, 34, 22, 0.7)',
                border: '1px solid rgba(34, 139, 34, 0.2)'
              }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="body2" sx={{ color: '#6B8E23', fontWeight: 600, mb: 0.5 }}>
                  👤 Anonymous
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(143, 188, 143, 0.6)' }}>
                  Hide your identity from the Illuminati. Syncs across devices without revealing who you are. 🔺👁️
                </Typography>
              </CardContent>
            </Card>
            <Card
              sx={{
                flex: 1,
                background: 'rgba(22, 34, 22, 0.7)',
                border: '1px solid rgba(139, 69, 19, 0.2)'
              }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="body2" sx={{ color: '#CD853F', fontWeight: 600, mb: 0.5 }}>
                  📱 Local Only
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(222, 184, 135, 0.6)' }}>
                  Record sightings fast while in the action! Sign in later to sync when you&apos;re back at camp. 🏕️
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Container>

        {/* Easter egg - hiding bigfoot */}
        <HidingBigfoot id="signin-page" size={50} opacity={0.12} />
      </Box>
    </>
  );
}
