import { BigfootIcon } from '@/components/BigfootIcon';
import { HidingBigfoot } from '@/components/HidingBigfoot';
import { SessionGuard } from '@/components/SessionGuard';
import { SyncDiagnosticsDialog } from '@/components/SyncDiagnosticsDialog';
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
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fab,
  IconButton,
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
import { CSSProperties, useCallback, useEffect, useRef, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { List } from 'react-window';

// Hook for detecting scroll direction
function useScrollDirection() {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  const updateScrollDir = useCallback(() => {
    const scrollY = window.scrollY;
    const direction = scrollY > lastScrollY.current ? 'down' : 'up';
    
    // Only hide if scrolled down more than 100px and still scrolling down
    if (direction === 'down' && scrollY > 100) {
      setIsVisible(false);
    } else if (direction === 'up' || scrollY < 50) {
      setIsVisible(true);
    }
    
    lastScrollY.current = scrollY > 0 ? scrollY : 0;
    ticking.current = false;
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(updateScrollDir);
        ticking.current = true;
      }
    };
    
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [updateScrollDir]);

  return isVisible;
}
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

// Row height for virtualized list - taller for mobile readability
const ROW_HEIGHT = 140;

// Virtualized sightings list component
interface SightingsListProps {
  sightings: Sighting[];
  canDelete: (sighting: Sighting) => boolean;
  onDelete: (sighting: Sighting) => void;
  formatDate: (date: string) => string;
}

interface RowProps {
  sightings: Sighting[];
  canDelete: (sighting: Sighting) => boolean;
  onDelete: (sighting: Sighting) => void;
  formatDate: (date: string) => string;
}

function SightingRow({
  index,
  style,
  sightings,
  canDelete,
  onDelete,
  formatDate
}: {
  index: number;
  style: CSSProperties;
  sightings: Sighting[];
  canDelete: (sighting: Sighting) => boolean;
  onDelete: (sighting: Sighting) => void;
  formatDate: (date: string) => string;
}) {
  const sighting = sightings[index];
  return (
    <Box
      style={style}
      sx={{
        borderBottom: '1px solid rgba(34, 139, 34, 0.15)'
      }}>
      <ListItem
        sx={{
          height: ROW_HEIGHT,
          py: 2,
          alignItems: 'flex-start',
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
              onClick={() => onDelete(sighting)}
              sx={{
                color: 'rgba(255,255,255,0.4)',
                mt: 1,
                '&:hover': {
                  color: '#CD5C5C',
                  background: 'rgba(205, 92, 92, 0.1)'
                }
              }}>
              <DeleteIcon />
            </IconButton>
          ) : (
            <Tooltip title="Not your sighting, buddy!">
              <Chip
                label="Other tracker"
                size="small"
                sx={{
                  height: 22,
                  fontSize: '0.7rem',
                  mt: 1,
                  background: 'rgba(100, 181, 246, 0.15)',
                  color: 'rgba(100, 181, 246, 0.7)',
                  border: '1px solid rgba(100, 181, 246, 0.3)'
                }}
              />
            </Tooltip>
          )
        }>
        <ListItemIcon sx={{ mt: 0.5 }}>
          <Box sx={{ fontSize: 28 }}>👣</Box>
        </ListItemIcon>
        <ListItemText
          primary={
            <Typography
              sx={{
                color: '#C8E6C9',
                fontWeight: 500,
                fontSize: '1rem',
                lineHeight: 1.5,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                pr: 4
              }}>
              {sighting.comments}
            </Typography>
          }
          secondary={
            <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              <Typography component="span" variant="body2" sx={{ color: 'rgba(143, 188, 143, 0.6)' }}>
                📅 {formatDate(sighting.date)}
              </Typography>
              {!sighting.user_id && (
                <Chip
                  label="Local"
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.7rem',
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
  );
}

function SightingsList({ sightings, canDelete, onDelete, formatDate }: SightingsListProps) {
  const rowProps: RowProps = { sightings, canDelete, onDelete, formatDate };
  const [listHeight, setListHeight] = useState(500);

  useEffect(() => {
    const updateHeight = () => {
      // Use 60% of viewport height, minimum 400px
      setListHeight(Math.max(400, Math.floor(window.innerHeight * 0.6)));
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  return (
    <List<RowProps>
      defaultHeight={listHeight}
      rowComponent={SightingRow}
      rowCount={sightings.length}
      rowHeight={ROW_HEIGHT}
      rowProps={rowProps}
      overscanCount={5}
      style={{ height: listHeight }}
    />
  );
}

export default function Sightings() {
  const powerSync = usePowerSync();
  const status = useStatus();
  const connector = useSupabaseConnector();
  const router = useRouter();
  const [sightingLimit, setSightingLimit] = useState(10);
  const statusBarVisible = useScrollDirection();
  const { data: intermediateSightings } = useQuery<Sighting>(/* sql */ `SELECT * FROM sightings ORDER BY date DESC LIMIT ?`, 
    // Increment by 1 to check if there are more sightings
    [sightingLimit + 1]
  );
  const {data: [sightingsCount]} = useQuery<{count: number}>(/* sql */ `SELECT COUNT(*) as count FROM sightings`);

  const sightings = intermediateSightings.slice(0, sightingLimit);
  const hasMore = sightingsCount?.count > sightingLimit;
  // Get user ID synchronously from the initialized connector (may be null if not signed in)
  const currentUserId = connector.currentUserId;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [syncDiagnosticsOpen, setSyncDiagnosticsOpen] = useState(false);

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
    <SessionGuard>
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
        {/* Floating Sync Status Bar */}
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1100,
            transform: statusBarVisible ? 'translateY(0)' : 'translateY(-100%)',
            transition: 'transform 0.3s ease-in-out',
          }}>
          <Box
            sx={{
              background: 'rgba(13, 26, 13, 0.95)',
              backdropFilter: 'blur(10px)',
              borderBottom: '1px solid rgba(34, 139, 34, 0.2)',
              boxShadow: '0 2px 16px rgba(0,0,0,0.4)',
              py: 1,
              px: 2,
            }}>
            <Container maxWidth="md">
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1
                }}>
                {/* Sync Status */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Tooltip title={`${syncStatus.tooltip} — Click for details`}>
                    <Chip
                      icon={syncStatus.icon}
                      label={syncStatus.label}
                      size="small"
                      onClick={() => setSyncDiagnosticsOpen(true)}
                      sx={{
                        background: `${syncStatus.color}20`,
                        color: syncStatus.color,
                        border: `1px solid ${syncStatus.color}40`,
                        cursor: 'pointer',
                        '& .MuiChip-icon': { color: syncStatus.color },
                        '&:hover': { background: `${syncStatus.color}30` }
                      }}
                    />
                  </Tooltip>

                  {/* Upload queue indicator */}
                  {status.dataFlowStatus.uploading && (
                    <Tooltip title="Changes waiting to upload — Click for details">
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
                        onClick={() => setSyncDiagnosticsOpen(true)}
                        sx={{
                          background: 'rgba(255, 183, 77, 0.2)',
                          color: '#FFB74D',
                          border: '1px solid rgba(255, 183, 77, 0.4)',
                          cursor: 'pointer',
                          '& .MuiChip-icon': { color: '#FFB74D' },
                          '&:hover': { background: 'rgba(255, 183, 77, 0.3)' }
                        }}
                      />
                    </Tooltip>
                  )}
                </Box>

                {/* Error indicators & actions */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {/* Download errors */}
                  {status.dataFlowStatus.downloadError && (
                    <Tooltip
                      title={`Download error — Click for details`}>
                      <Chip
                        icon={<ErrorOutlineIcon />}
                        label="Error"
                        size="small"
                        onClick={() => setSyncDiagnosticsOpen(true)}
                        sx={{
                          background: 'rgba(205, 92, 92, 0.2)',
                          color: '#CD5C5C',
                          border: '1px solid rgba(205, 92, 92, 0.4)',
                          cursor: 'pointer',
                          '& .MuiChip-icon': { color: '#CD5C5C' },
                          '&:hover': { background: 'rgba(205, 92, 92, 0.3)' }
                        }}
                      />
                    </Tooltip>
                  )}

                  {/* Upload errors */}
                  {status.dataFlowStatus.uploadError && (
                    <Tooltip title={`Upload error — Click for details`}>
                      <Chip
                        icon={<ErrorOutlineIcon />}
                        label="Error"
                        size="small"
                        onClick={() => setSyncDiagnosticsOpen(true)}
                        sx={{
                          background: 'rgba(205, 92, 92, 0.2)',
                          color: '#CD5C5C',
                          border: '1px solid rgba(205, 92, 92, 0.4)',
                          cursor: 'pointer',
                          '& .MuiChip-icon': { color: '#CD5C5C' },
                          '&:hover': { background: 'rgba(205, 92, 92, 0.3)' }
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
            </Container>
          </Box>
        </Box>

        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1, pt: 6 }}>
          {/* Compact Header with side-by-side layout */}
          <Box 
            sx={{ 
              mb: 3, 
              display: 'flex', 
              alignItems: 'center',
              gap: 3,
              p: 2,
              background: 'rgba(22, 34, 22, 0.5)',
              borderRadius: 3,
              border: '1px solid rgba(34, 139, 34, 0.15)',
            }}>
            {/* Bigfoot Icon - Left side */}
            <Box sx={{ flexShrink: 0 }}>
              <BigfootIcon size={72} />
            </Box>

            {/* Title content - Right side */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="h4"
                sx={{
                  color: '#8FBC8F',
                  fontWeight: 800,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.1,
                }}>
                SQUATCH WATCH
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: '#6B8E23',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  mt: 0.5,
                }}>
                <ForestIcon sx={{ fontSize: 16 }} />
                Bigfoot Sighting Tracker
                <ForestIcon sx={{ fontSize: 16 }} />
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'rgba(143, 188, 143, 0.4)', 
                  fontStyle: 'italic',
                  display: 'block',
                  mt: 0.5,
                }}>
                &ldquo;I want to believe&rdquo; — Synced offline with PowerSync
              </Typography>
            </Box>

            {/* Stats badge - Far right */}
            <Box 
              sx={{ 
                flexShrink: 0,
                textAlign: 'center',
                px: 2,
                py: 1,
                background: 'linear-gradient(145deg, rgba(34, 139, 34, 0.25) 0%, rgba(34, 139, 34, 0.1) 100%)',
                borderRadius: 2,
                border: '1px solid rgba(34, 139, 34, 0.3)',
              }}>
              <Typography
                variant="h3"
                sx={{
                  color: '#8FBC8F',
                  fontWeight: 800,
                  lineHeight: 1,
                  textShadow: '0 0 20px rgba(143, 188, 143, 0.3)'
                }}>
                {sightingsCount?.count ?? 0}
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'rgba(143, 188, 143, 0.5)',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  fontSize: '0.65rem',
                }}>
                Sightings
              </Typography>
            </Box>
          </Box>

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
              <InfiniteScroll 
              dataLength={sightings.length}
              next={() => setSightingLimit(sightingLimit + 10)}
              hasMore={hasMore}
              loader={<div>Loading...</div>}
              > 
              {sightings.map((sighting, index) => (<SightingRow
                index={index}
                style={{}}
                  key={sighting.id}
                  sightings={sightings}
                  canDelete={canDelete}
                  onDelete={handleDeleteSighting}
                  formatDate={formatDate}
                />  
              ))}
              </InfiniteScroll>
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

          {/* Sync Diagnostics Dialog */}
          <SyncDiagnosticsDialog open={syncDiagnosticsOpen} onClose={() => setSyncDiagnosticsOpen(false)} />

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
    </SessionGuard>
  );
}
