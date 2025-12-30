import { BigfootIcon } from '@/components/BigfootIcon';
import { HidingBigfoot } from '@/components/HidingBigfoot';
import { useSupabaseConnector } from '@/services/SupabaseConnectorProvider';
import AddIcon from '@mui/icons-material/Add';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import CloudSyncIcon from '@mui/icons-material/CloudSync';
import DeleteIcon from '@mui/icons-material/Delete';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ForestIcon from '@mui/icons-material/Forest';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LogoutIcon from '@mui/icons-material/Logout';
import SyncIcon from '@mui/icons-material/Sync';
import UploadIcon from '@mui/icons-material/Upload';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Fab,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Snackbar,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import { usePowerSync, useQuery, useStatus } from '@powersync/react';
import { useFormik } from 'formik';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';

interface Sighting {
  id: string;
  date: string;
  comments: string;
  user_id: string | null;
}

// Fun random taglines for empty state
const EMPTY_STATE_MESSAGES = [
  "No sightings yet... He's out there somewhere! 👀",
  'The forest is quiet... too quiet. Report a sighting!',
  "Bigfoot hasn't shown himself yet. Be the first to spot him!",
  '0 sightings? Sounds like someone needs to go hiking! 🏕️'
];

// Fun success messages
const SUCCESS_MESSAGES = [
  'Sighting logged! The truth is out there! 👣',
  'Another piece of evidence! Bigfoot researchers thank you!',
  "Documented! They can't hide forever! 🔍",
  "Logged! You're doing important work, fellow believer!"
];

// Helper to get random message (outside component to avoid lint warnings)
const getRandomMessage = (messages: string[]) => {
  const index = Math.floor(Math.random() * messages.length);
  return messages[index];
};

export default function Sightings() {
  const powerSync = usePowerSync();
  const status = useStatus();
  const connector = useSupabaseConnector();
  const router = useRouter();
  const { data: sightings } = useQuery<Sighting>('SELECT * FROM sightings ORDER BY date DESC');

  // Get user ID synchronously from the initialized connector (may be null if not signed in)
  const currentUserId = connector.currentUserId;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const formik = useFormik({
    initialValues: {
      date: new Date().toISOString().split('T')[0], // Default to today
      comments: ''
    },
    validate: (values) => {
      const errors: { date?: string; comments?: string } = {};
      if (!values.date) {
        errors.date = 'When did you see the big guy?';
      } else {
        const parsedDate = new Date(values.date);
        if (isNaN(parsedDate.getTime())) {
          errors.date = "That's not a real date, friend";
        }
      }
      if (!values.comments) {
        errors.comments = "C'mon, tell us what you saw!";
      }
      return errors;
    },
    onSubmit: async (values, { resetForm }) => {
      try {
        // Convert date input (YYYY-MM-DD) to ISO string
        const isoDate = new Date(values.date).toISOString();

        // Fetch user ID asynchronously - will be null in local-only mode
        // The connector will patch in the real user_id when uploading
        const userId = await connector.getUserId();

        await powerSync.execute('INSERT INTO sightings (id, date, comments, user_id) VALUES (?, ?, ?, ?)', [
          crypto.randomUUID(),
          isoDate,
          values.comments,
          userId // null if no session, connector patches on upload
        ]);
        resetForm();
        setDialogOpen(false);
        setSnackbarMessage(getRandomMessage(SUCCESS_MESSAGES));
        setSnackbarOpen(true);
      } catch (error) {
        console.warn('Failed to add sighting:', error);
        setSnackbarMessage("Error: Bigfoot must've interfered with the database! 📡");
        setSnackbarOpen(true);
      }
    }
  });

  const handleDialogClose = () => {
    setDialogOpen(false);
    formik.resetForm();
  };

  const handleDeleteSighting = async (sighting: Sighting) => {
    // User can only delete sightings where user_id matches (null === null is allowed)
    if (sighting.user_id !== currentUserId) {
      setSnackbarMessage("Hey! You can't delete someone else's sighting! 🙅");
      setSnackbarOpen(true);
      return;
    }

    try {
      await powerSync.execute('DELETE FROM sightings WHERE id = ?', [sighting.id]);
      setSnackbarMessage('Sighting removed. Maybe it was just a bear after all... 🐻');
      setSnackbarOpen(true);
    } catch (error) {
      console.warn('Failed to delete sighting:', error);
      setSnackbarMessage('Error: Failed to delete. The evidence persists!');
      setSnackbarOpen(true);
    }
  };

  // User can delete if user_id matches (null === null is allowed)
  const canDelete = (sighting: Sighting) => sighting.user_id === currentUserId;

  const formatDate = (isoDateStr: string) => {
    try {
      const date = new Date(isoDateStr);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return isoDateStr;
      }
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.warn('Failed to format date:', error);
      return isoDateStr;
    }
  };

  const handleSignOut = async () => {
    try {
      await powerSync.disconnectAndClear();
      await connector.signOut();
      router.push('/');
    } catch (error) {
      console.warn('Sign out error:', error);
      router.push('/');
    }
  };

  // Get sync status info
  const getSyncStatus = () => {
    if (!status.connected) {
      return {
        icon: <CloudOffIcon />,
        label: 'Disconnected',
        color: '#CD5C5C',
        tooltip: 'Not connected to sync service'
      };
    }

    if (status.dataFlowStatus.uploading) {
      return {
        icon: <UploadIcon />,
        label: 'Uploading',
        color: '#FFB74D',
        tooltip: 'Uploading changes...'
      };
    }

    if (status.dataFlowStatus.downloading) {
      return {
        icon: <CloudSyncIcon />,
        label: 'Syncing',
        color: '#64B5F6',
        tooltip: 'Downloading changes...'
      };
    }

    return {
      icon: <CloudDoneIcon />,
      label: 'Synced',
      color: '#81C784',
      tooltip: 'All data synced'
    };
  };

  const syncStatus = getSyncStatus();

  return (
    <>
      <Head>
        <title>Squatch Watch | Bigfoot Sighting Tracker</title>
        <meta name="description" content="Track and report Bigfoot, Sasquatch, and cryptid sightings" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(180deg, #1a2f1a 0%, #0d1a0d 50%, #0a1408 100%)',
          py: 4,
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
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
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
            <Typography variant="body2" sx={{ color: 'rgba(143, 188, 143, 0.5)', mt: 1, fontStyle: 'italic' }}>
              &ldquo;I want to believe&rdquo; — Synced offline with PowerSync
            </Typography>
          </Box>

          {/* Sync Status Card */}
          <Card
            sx={{
              mb: 2,
              background: 'rgba(22, 34, 22, 0.9)',
              border: '1px solid rgba(34, 139, 34, 0.2)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
            }}>
            <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 1
                }}>
                {/* Sync Status */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Tooltip title={syncStatus.tooltip}>
                    <Chip
                      icon={syncStatus.icon}
                      label={syncStatus.label}
                      size="small"
                      sx={{
                        background: `${syncStatus.color}20`,
                        color: syncStatus.color,
                        border: `1px solid ${syncStatus.color}40`,
                        '& .MuiChip-icon': { color: syncStatus.color }
                      }}
                    />
                  </Tooltip>

                  {/* Upload queue indicator */}
                  {status.dataFlowStatus.uploading && (
                    <Tooltip title="Changes waiting to upload">
                      <Chip
                        icon={
                          <SyncIcon
                            sx={{
                              animation: 'spin 1s linear infinite',
                              '@keyframes spin': {
                                '0%': { transform: 'rotate(0deg)' },
                                '100%': { transform: 'rotate(360deg)' }
                              }
                            }}
                          />
                        }
                        label="Uploading..."
                        size="small"
                        sx={{
                          background: 'rgba(255, 183, 77, 0.2)',
                          color: '#FFB74D',
                          border: '1px solid rgba(255, 183, 77, 0.4)',
                          '& .MuiChip-icon': { color: '#FFB74D' }
                        }}
                      />
                    </Tooltip>
                  )}
                </Box>

                {/* Error indicators */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {status.lastSyncedAt && (
                    <Typography variant="caption" sx={{ color: 'rgba(143, 188, 143, 0.5)' }}>
                      Last sync: {new Date(status.lastSyncedAt).toLocaleTimeString()}
                    </Typography>
                  )}

                  {/* Download errors */}
                  {status.dataFlowStatus.downloadError && (
                    <Tooltip
                      title={`Download error: ${status.dataFlowStatus.downloadError.message || 'Unknown error'}`}>
                      <Chip
                        icon={<ErrorOutlineIcon />}
                        label="Download Error"
                        size="small"
                        sx={{
                          background: 'rgba(205, 92, 92, 0.2)',
                          color: '#CD5C5C',
                          border: '1px solid rgba(205, 92, 92, 0.4)',
                          '& .MuiChip-icon': { color: '#CD5C5C' }
                        }}
                      />
                    </Tooltip>
                  )}

                  {/* Upload errors */}
                  {status.dataFlowStatus.uploadError && (
                    <Tooltip title={`Upload error: ${status.dataFlowStatus.uploadError.message || 'Unknown error'}`}>
                      <Chip
                        icon={<ErrorOutlineIcon />}
                        label="Upload Error"
                        size="small"
                        sx={{
                          background: 'rgba(205, 92, 92, 0.2)',
                          color: '#CD5C5C',
                          border: '1px solid rgba(205, 92, 92, 0.4)',
                          '& .MuiChip-icon': { color: '#CD5C5C' }
                        }}
                      />
                    </Tooltip>
                  )}

                  {/* Sign out / Sign in button */}
                  <Tooltip title={currentUserId ? 'Sign out' : 'Sign in to sync'}>
                    <IconButton
                      onClick={currentUserId ? handleSignOut : () => router.push('/')}
                      size="small"
                      sx={{
                        color: currentUserId ? 'rgba(143, 188, 143, 0.5)' : '#FFB74D',
                        '&:hover': {
                          color: currentUserId ? '#8FBC8F' : '#FFA726',
                          background: currentUserId ? 'rgba(34, 139, 34, 0.1)' : 'rgba(255, 183, 77, 0.1)'
                        }
                      }}>
                      <LogoutIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Local only notice - show when not signed in */}
          {!currentUserId && (
            <Alert
              severity="info"
              sx={{
                mb: 2,
                background: 'rgba(139, 69, 19, 0.15)',
                border: '1px solid rgba(139, 69, 19, 0.3)',
                color: '#DEB887',
                '& .MuiAlert-icon': { color: '#CD853F' }
              }}
              action={
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => router.push('/')}
                  sx={{ color: '#DEB887', fontWeight: 600 }}>
                  Sign In
                </Button>
              }>
              <Typography variant="body2">
                <strong>Local Mode:</strong> Your sightings are stored on this device only. Sign in anytime to sync
                across devices!
              </Typography>
            </Alert>
          )}

          {/* Stats Card */}
          <Card
            sx={{
              mb: 3,
              background: 'linear-gradient(145deg, rgba(34, 139, 34, 0.2) 0%, rgba(34, 139, 34, 0.05) 100%)',
              border: '1px solid rgba(34, 139, 34, 0.3)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
            }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="overline" sx={{ color: '#6B8E23', letterSpacing: 2 }}>
                DOCUMENTED ENCOUNTERS
              </Typography>
              <Typography
                variant="h1"
                sx={{
                  color: '#8FBC8F',
                  fontWeight: 800,
                  textShadow: '0 0 20px rgba(143, 188, 143, 0.3)'
                }}>
                {sightings.length}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                {sightings.length === 0
                  ? 'No sightings... yet'
                  : sightings.length === 1
                  ? 'credible report on file'
                  : 'credible reports on file'}
              </Typography>
            </CardContent>
          </Card>

          {/* Sightings List */}
          <Paper
            sx={{
              background: 'rgba(22, 34, 22, 0.9)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(34, 139, 34, 0.2)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
            }}>
            <Box
              sx={{
                p: 2,
                borderBottom: '1px solid rgba(34, 139, 34, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
              <LocationOnIcon sx={{ color: '#6B8E23' }} />
              <Typography variant="h6" sx={{ color: '#8FBC8F' }}>
                Field Reports
              </Typography>
            </Box>

            {sightings.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h1" sx={{ fontSize: 64, mb: 2 }}>
                  🌲
                </Typography>
                <Typography sx={{ color: 'rgba(143, 188, 143, 0.7)', fontSize: '1.1rem' }}>
                  {getRandomMessage(EMPTY_STATE_MESSAGES)}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)', mt: 1 }}>
                  Click the + button to log your first encounter
                </Typography>
              </Box>
            ) : (
              <List sx={{ py: 0 }}>
                {sightings.map((sighting, index) => (
                  <Box key={sighting.id}>
                    {index > 0 && <Divider sx={{ borderColor: 'rgba(34, 139, 34, 0.15)' }} />}
                    <ListItem
                      sx={{
                        py: 2,
                        transition: 'background 0.2s',
                        '&:hover': {
                          background: 'rgba(34, 139, 34, 0.1)'
                        }
                      }}
                      secondaryAction={
                        canDelete(sighting) ? (
                          <IconButton
                            edge="end"
                            aria-label="delete"
                            onClick={() => handleDeleteSighting(sighting)}
                            sx={{
                              color: 'rgba(255,255,255,0.4)',
                              '&:hover': {
                                color: '#CD5C5C',
                                background: 'rgba(205, 92, 92, 0.1)'
                              }
                            }}>
                            <DeleteIcon />
                          </IconButton>
                        ) : (
                          // Show "Other tracker" chip for other users' sightings
                          <Tooltip title="Not your sighting, buddy!">
                            <Chip
                              label="Other tracker"
                              size="small"
                              sx={{
                                height: 22,
                                fontSize: '0.7rem',
                                background: 'rgba(100, 181, 246, 0.15)',
                                color: 'rgba(100, 181, 246, 0.7)',
                                border: '1px solid rgba(100, 181, 246, 0.3)'
                              }}
                            />
                          </Tooltip>
                        )
                      }>
                      <ListItemIcon>
                        <Box sx={{ fontSize: 24 }}>👣</Box>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography sx={{ color: '#C8E6C9', fontWeight: 500 }}>{sighting.comments}</Typography>
                        }
                        secondary={
                          <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <Typography component="span" variant="caption" sx={{ color: 'rgba(143, 188, 143, 0.6)' }}>
                              📅 {formatDate(sighting.date)}
                            </Typography>
                            {!sighting.user_id && (
                              <Chip
                                label="Local"
                                size="small"
                                sx={{
                                  height: 18,
                                  fontSize: '0.65rem',
                                  background: 'rgba(139, 69, 19, 0.2)',
                                  color: '#CD853F',
                                  border: '1px solid rgba(139, 69, 19, 0.3)'
                                }}
                              />
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                  </Box>
                ))}
              </List>
            )}
          </Paper>

          {/* Floating Action Button */}
          <Fab
            color="primary"
            aria-label="add sighting"
            onClick={() => setDialogOpen(true)}
            sx={{
              position: 'fixed',
              bottom: 32,
              right: 32,
              background: 'linear-gradient(135deg, #228B22 0%, #006400 100%)',
              boxShadow: '0 4px 20px rgba(34, 139, 34, 0.5)',
              '&:hover': {
                background: 'linear-gradient(135deg, #32CD32 0%, #228B22 100%)'
              }
            }}>
            <AddIcon />
          </Fab>

          {/* Add Sighting Dialog */}
          <Dialog
            open={dialogOpen}
            onClose={handleDialogClose}
            PaperProps={{
              sx: {
                background: 'linear-gradient(180deg, #1a2f1a 0%, #0d1a0d 100%)',
                border: '1px solid rgba(34, 139, 34, 0.3)',
                minWidth: 400
              }
            }}>
            <form onSubmit={formik.handleSubmit}>
              <DialogTitle
                sx={{
                  color: '#8FBC8F',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2
                }}>
                <Box sx={{ fontSize: 28 }}>👣</Box>
                Report a Sighting
              </DialogTitle>
              <DialogContent>
                <Typography variant="body2" sx={{ color: 'rgba(143, 188, 143, 0.7)', mb: 2 }}>
                  You saw something in the woods? Tell us everything!
                </Typography>

                <TextField
                  autoFocus
                  margin="dense"
                  label="When did you see it?"
                  type="date"
                  fullWidth
                  variant="outlined"
                  name="date"
                  value={formik.values.date}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.date && Boolean(formik.errors.date)}
                  helperText={formik.touched.date && formik.errors.date}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    mt: 2,
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: 'rgba(34, 139, 34, 0.3)'
                      },
                      '&:hover fieldset': {
                        borderColor: '#228B22'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#32CD32'
                      }
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(143, 188, 143, 0.7)'
                    },
                    '& .MuiInputBase-input': {
                      color: '#C8E6C9'
                    }
                  }}
                />
                <TextField
                  margin="dense"
                  label="What did you see?"
                  type="text"
                  fullWidth
                  multiline
                  rows={4}
                  variant="outlined"
                  name="comments"
                  value={formik.values.comments}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.comments && Boolean(formik.errors.comments)}
                  helperText={formik.touched.comments && formik.errors.comments}
                  placeholder="I was hiking near the creek when I heard branches snapping..."
                  sx={{
                    mt: 2,
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: 'rgba(34, 139, 34, 0.3)'
                      },
                      '&:hover fieldset': {
                        borderColor: '#228B22'
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#32CD32'
                      }
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(143, 188, 143, 0.7)'
                    },
                    '& .MuiInputBase-input': {
                      color: '#C8E6C9'
                    }
                  }}
                />
              </DialogContent>
              <DialogActions sx={{ p: 2, pt: 0 }}>
                <Button onClick={handleDialogClose} sx={{ color: 'rgba(143, 188, 143, 0.5)' }}>
                  Nevermind
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={formik.isSubmitting}
                  sx={{
                    background: 'linear-gradient(135deg, #228B22 0%, #006400 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #32CD32 0%, #228B22 100%)'
                    }
                  }}>
                  {formik.isSubmitting ? 'Documenting...' : 'Log Sighting 👣'}
                </Button>
              </DialogActions>
            </form>
          </Dialog>

          {/* Snackbar for notifications */}
          <Snackbar
            open={snackbarOpen}
            autoHideDuration={4000}
            onClose={() => setSnackbarOpen(false)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
            <Alert
              onClose={() => setSnackbarOpen(false)}
              severity={snackbarMessage.includes('Error') ? 'error' : 'success'}
              sx={{
                background: 'rgba(22, 34, 22, 0.95)',
                border: '1px solid rgba(34, 139, 34, 0.3)',
                color: '#C8E6C9'
              }}>
              {snackbarMessage}
            </Alert>
          </Snackbar>
        </Container>

        {/* Easter egg - hiding bigfoot */}
        <HidingBigfoot id="sightings-page" size={45} opacity={0.1} />
      </Box>
    </>
  );
}
