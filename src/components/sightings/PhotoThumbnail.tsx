import { usePhotoUrl } from '@/services/useAttachmentQueue';
import CloseIcon from '@mui/icons-material/Close';
import ImageIcon from '@mui/icons-material/Image';
import { Box, CircularProgress, Dialog, IconButton } from '@mui/material';
import { useState } from 'react';

interface PhotoThumbnailProps {
  uri: string;
}

export function PhotoThumbnail({ uri }: PhotoThumbnailProps) {
  const { url: photoUrl, loading } = usePhotoUrl(uri);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);

  if (loading) {
    return (
      <Box
        sx={{
          width: 60,
          height: 60,
          borderRadius: 1,
          background: 'rgba(34, 139, 34, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
        <CircularProgress size={20} sx={{ color: '#8FBC8F' }} />
      </Box>
    );
  }

  if (!photoUrl) {
    return (
      <Box
        sx={{
          width: 60,
          height: 60,
          borderRadius: 1,
          background: 'rgba(34, 139, 34, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
        <ImageIcon sx={{ color: 'rgba(143, 188, 143, 0.5)' }} />
      </Box>
    );
  }

  return (
    <>
      <Box
        component="img"
        src={photoUrl}
        alt="Sighting photo"
        onClick={() => setFullscreenOpen(true)}
        sx={{
          width: 60,
          height: 60,
          borderRadius: 1,
          objectFit: 'cover',
          border: '2px solid rgba(34, 139, 34, 0.3)',
          cursor: 'pointer',
          transition: 'transform 0.2s, border-color 0.2s',
          '&:hover': {
            transform: 'scale(1.05)',
            borderColor: 'rgba(34, 139, 34, 0.6)'
          }
        }}
      />
      <Dialog
        open={fullscreenOpen}
        onClose={() => setFullscreenOpen(false)}
        maxWidth={false}
        PaperProps={{
          sx: {
            background: 'rgba(0, 0, 0, 0.95)',
            boxShadow: 'none',
            m: 1,
            maxHeight: '95vh',
            maxWidth: '95vw'
          }
        }}>
        <IconButton
          onClick={() => setFullscreenOpen(false)}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            color: 'white',
            background: 'rgba(0, 0, 0, 0.5)',
            '&:hover': {
              background: 'rgba(0, 0, 0, 0.7)'
            },
            zIndex: 1
          }}>
          <CloseIcon />
        </IconButton>
        <Box
          component="img"
          src={photoUrl}
          alt="Sighting photo fullscreen"
          sx={{
            maxWidth: '90vw',
            maxHeight: '90vh',
            objectFit: 'contain'
          }}
        />
      </Dialog>
    </>
  );
}

