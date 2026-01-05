import { HidingBigfoot } from '@/components/HidingBigfoot';
import { SessionGuard } from '@/components/SessionGuard';
import {
  AddSightingDialog,
  PageHeader,
  Sighting,
  SightingsList,
  StatsCard,
  SyncStatusCard
} from '@/components/sightings';
import { getCameraService, PhotoResult } from '@/services/camera';
import { useSupabaseConnector } from '@/services/SupabaseConnectorProvider';
import { useAttachmentQueue } from '@/services/useAttachmentQueue';
import AddIcon from '@mui/icons-material/Add';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { Alert, Box, Button, Container, Fab, Paper, Snackbar, Typography } from '@mui/material';
import { usePowerSync, useQuery, useStatus } from '@powersync/react';
import type { AttachmentRecord, Transaction } from '@powersync/web';
import { FormikHelpers, useFormik } from 'formik';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useCallback, useMemo, useState } from 'react';

// Fun random messages
const EMPTY_STATE_MESSAGES = [
  "No sightings yet... He's out there somewhere! 👀",
  'The forest is quiet... too quiet. Report a sighting!',
  "Bigfoot hasn't shown himself yet. Be the first to spot him!",
  '0 sightings? Sounds like someone needs to go hiking! 🏕️'
];

const SUCCESS_MESSAGES = [
  'Sighting logged! The truth is out there! 👣',
  'Another piece of evidence! Bigfoot researchers thank you!',
  "Documented! They can't hide forever! 🔍",
  "Logged! You're doing important work, fellow believer!"
];

const getRandomMessage = (messages: string[]) => messages[Math.floor(Math.random() * messages.length)];

interface SightingFormValues {
  date: string;
  comments: string;
}

export default function Sightings() {
  const powerSync = usePowerSync();
  const status = useStatus();
  const connector = useSupabaseConnector();
  const router = useRouter();
  const attachmentQueue = useAttachmentQueue();
  const cameraService = useMemo(() => getCameraService(), []);

  const { data: sightings } = useQuery<Sighting>(`
    SELECT 
      s.id, s.date, s.comments, s.user_id, s.photo_id,
      a.local_uri as photo_uri
    FROM sightings s
    LEFT JOIN attachments a ON s.photo_id = a.id
    ORDER BY s.date DESC
  `);

  const currentUserId = connector.currentUserId;

  // Dialog and notification state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Photo state
  const [pendingPhoto, setPendingPhoto] = useState<PhotoResult | null>(null);
  const [photoMenuAnchor, setPhotoMenuAnchor] = useState<null | HTMLElement>(null);
  const [isCapturingPhoto, setIsCapturingPhoto] = useState(false);

  // Form handling
  const formik = useFormik<SightingFormValues>({
    initialValues: {
      date: new Date().toISOString().split('T')[0],
      comments: ''
    },
    validate: (values) => {
      const errors: { date?: string; comments?: string } = {};
      if (!values.date) {
        errors.date = 'When did you see the big guy?';
      } else if (isNaN(new Date(values.date).getTime())) {
        errors.date = "That's not a real date, friend";
      }
      if (!values.comments) {
        errors.comments = "C'mon, tell us what you saw!";
      }
      return errors;
    },
    onSubmit: async (values, { resetForm }: FormikHelpers<SightingFormValues>) => {
      try {
        const isoDate = new Date(values.date).toISOString();
        const userId = await connector.getUserId();
        const sightingId = crypto.randomUUID();

        if (pendingPhoto && attachmentQueue) {
          try {
            const binaryString = atob(pendingPhoto.base64Data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }

            await attachmentQueue.saveFile({
              data: bytes.buffer,
              fileExtension: pendingPhoto.mimeType?.split('/')[1] || 'jpeg',
              mediaType: pendingPhoto.mimeType,
              updateHook: async (tx: Transaction, attachment: AttachmentRecord) => {
                await tx.execute(
                  'INSERT INTO sightings (id, date, comments, user_id, photo_id) VALUES (?, ?, ?, ?, ?)',
                  [sightingId, isoDate, values.comments, userId, attachment.id]
                );
              }
            });
          } catch (photoError) {
            console.warn('Failed to save photo:', photoError);
            await powerSync.execute(
              'INSERT INTO sightings (id, date, comments, user_id, photo_id) VALUES (?, ?, ?, ?, ?)',
              [sightingId, isoDate, values.comments, userId, null]
            );
          }
        } else {
          await powerSync.execute(
            'INSERT INTO sightings (id, date, comments, user_id, photo_id) VALUES (?, ?, ?, ?, ?)',
            [sightingId, isoDate, values.comments, userId, null]
          );
        }

        resetForm();
        setPendingPhoto(null);
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

  // Handlers
  const handleDialogClose = () => {
    setDialogOpen(false);
    formik.resetForm();
    setPendingPhoto(null);
  };

  const handleDeleteSighting = async (sighting: Sighting) => {
    if (sighting.user_id !== currentUserId) {
      setSnackbarMessage("Hey! You can't delete someone else's sighting! 🙅");
      setSnackbarOpen(true);
      return;
    }

    try {
      if (sighting.photo_id && attachmentQueue) {
        try {
          await attachmentQueue.deleteFile({
            id: sighting.photo_id,
            updateHook: async (tx: Transaction) => {
              await tx.execute('DELETE FROM sightings WHERE id = ?', [sighting.id]);
            }
          });
        } catch (photoError) {
          console.warn('Failed to delete photo:', photoError);
          await powerSync.execute('DELETE FROM sightings WHERE id = ?', [sighting.id]);
        }
      } else {
        await powerSync.execute('DELETE FROM sightings WHERE id = ?', [sighting.id]);
      }

      setSnackbarMessage('Sighting removed. Maybe it was just a bear after all... 🐻');
      setSnackbarOpen(true);
    } catch (error) {
      console.warn('Failed to delete sighting:', error);
      setSnackbarMessage('Error: Failed to delete. The evidence persists!');
      setSnackbarOpen(true);
    }
  };

  const canDelete = (sighting: Sighting) => sighting.user_id === currentUserId;

  const formatDate = (isoDateStr: string) => {
    try {
      const date = new Date(isoDateStr);
      if (isNaN(date.getTime())) return isoDateStr;
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return isoDateStr;
    }
  };

  const handleSignOut = async () => {
    try {
      await powerSync.disconnectAndClear();
      await connector.signOut();
      router.push('/');
    } catch {
      router.push('/');
    }
  };

  // Camera handlers
  const handleOpenPhotoMenu = (event: React.MouseEvent<HTMLElement>) => setPhotoMenuAnchor(event.currentTarget);
  const handleClosePhotoMenu = () => setPhotoMenuAnchor(null);

  const handleTakePhoto = useCallback(async () => {
    handleClosePhotoMenu();
    setIsCapturingPhoto(true);
    try {
      const photo = await cameraService.takePhoto();
      setPendingPhoto(photo);
    } catch (error) {
      if ((error as Error).message !== 'Photo capture cancelled') {
        setSnackbarMessage('Failed to capture photo. Try again! 📷');
        setSnackbarOpen(true);
      }
    } finally {
      setIsCapturingPhoto(false);
    }
  }, [cameraService]);

  const handlePickPhoto = useCallback(async () => {
    handleClosePhotoMenu();
    setIsCapturingPhoto(true);
    try {
      const photo = await cameraService.pickPhoto();
      setPendingPhoto(photo);
    } catch (error) {
      if ((error as Error).message !== 'Photo capture cancelled') {
        setSnackbarMessage('Failed to select photo. Try again! 📷');
        setSnackbarOpen(true);
      }
    } finally {
      setIsCapturingPhoto(false);
    }
  }, [cameraService]);

  return (
    <SessionGuard>
      <Head>
        <title>Squatch Watch | Bigfoot Sighting Tracker</title>
        <meta name="description" content="Track and report Bigfoot, Sasquatch, and cryptid sightings" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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
          <PageHeader />

          <SyncStatusCard
            status={status}
            currentUserId={currentUserId}
            onSignOut={handleSignOut}
            onSignIn={() => router.push('/')}
          />

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

          <StatsCard count={sightings.length} />

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
              <SightingsList
                sightings={sightings}
                canDelete={canDelete}
                onDelete={handleDeleteSighting}
                formatDate={formatDate}
              />
            )}
          </Paper>

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

          <AddSightingDialog
            open={dialogOpen}
            onClose={handleDialogClose}
            formik={formik}
            pendingPhoto={pendingPhoto}
            onRemovePhoto={() => setPendingPhoto(null)}
            photoMenuAnchor={photoMenuAnchor}
            onOpenPhotoMenu={handleOpenPhotoMenu}
            onClosePhotoMenu={handleClosePhotoMenu}
            onTakePhoto={handleTakePhoto}
            onPickPhoto={handlePickPhoto}
            isCapturingPhoto={isCapturingPhoto}
          />

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

        <HidingBigfoot id="sightings-page" size={45} opacity={0.1} />
      </Box>
    </SessionGuard>
  );
}
