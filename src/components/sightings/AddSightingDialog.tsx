import { PhotoResult } from '@/services/camera';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import CloseIcon from '@mui/icons-material/Close';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Typography
} from '@mui/material';
import { FormikProps } from 'formik';

interface SightingFormValues {
  date: string;
  comments: string;
}

interface AddSightingDialogProps {
  open: boolean;
  onClose: () => void;
  formik: FormikProps<SightingFormValues>;
  pendingPhoto: PhotoResult | null;
  onRemovePhoto: () => void;
  photoMenuAnchor: HTMLElement | null;
  onOpenPhotoMenu: (event: React.MouseEvent<HTMLElement>) => void;
  onClosePhotoMenu: () => void;
  onTakePhoto: () => void;
  onPickPhoto: () => void;
  isCapturingPhoto: boolean;
}

export function AddSightingDialog({
  open,
  onClose,
  formik,
  pendingPhoto,
  onRemovePhoto,
  photoMenuAnchor,
  onOpenPhotoMenu,
  onClosePhotoMenu,
  onTakePhoto,
  onPickPhoto,
  isCapturingPhoto
}: AddSightingDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          background: 'linear-gradient(180deg, #1a2f1a 0%, #0d1a0d 100%)',
          border: '1px solid rgba(34, 139, 34, 0.3)',
          minWidth: 400,
          maxWidth: 500
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

          {/* Photo Section */}
          <Box sx={{ mb: 2 }}>
            {pendingPhoto ? (
              <Box sx={{ position: 'relative', display: 'inline-block' }}>
                <Box
                  component="img"
                  src={`data:${pendingPhoto.mimeType};base64,${pendingPhoto.base64Data}`}
                  alt="Sighting preview"
                  sx={{
                    maxWidth: '100%',
                    maxHeight: 200,
                    borderRadius: 2,
                    border: '2px solid rgba(34, 139, 34, 0.4)'
                  }}
                />
                <IconButton
                  onClick={onRemovePhoto}
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    background: 'rgba(0,0,0,0.6)',
                    color: '#fff',
                    '&:hover': {
                      background: 'rgba(205, 92, 92, 0.8)'
                    }
                  }}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            ) : (
              <Button
                variant="outlined"
                onClick={onOpenPhotoMenu}
                disabled={isCapturingPhoto}
                startIcon={isCapturingPhoto ? <CircularProgress size={18} /> : <CameraAltIcon />}
                sx={{
                  borderColor: 'rgba(34, 139, 34, 0.4)',
                  color: '#8FBC8F',
                  '&:hover': {
                    borderColor: '#228B22',
                    background: 'rgba(34, 139, 34, 0.1)'
                  }
                }}>
                {isCapturingPhoto ? 'Capturing...' : 'Add Photo Evidence 📷'}
              </Button>
            )}

            <Menu
              anchorEl={photoMenuAnchor}
              open={Boolean(photoMenuAnchor)}
              onClose={onClosePhotoMenu}
              PaperProps={{
                sx: {
                  background: 'rgba(22, 34, 22, 0.95)',
                  border: '1px solid rgba(34, 139, 34, 0.3)'
                }
              }}>
              <MenuItem onClick={onTakePhoto} sx={{ color: '#C8E6C9' }}>
                <CameraAltIcon sx={{ mr: 1, color: '#8FBC8F' }} />
                Take Photo
              </MenuItem>
              <MenuItem onClick={onPickPhoto} sx={{ color: '#C8E6C9' }}>
                <PhotoLibraryIcon sx={{ mr: 1, color: '#8FBC8F' }} />
                Choose from Gallery
              </MenuItem>
            </Menu>
          </Box>

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
                '& fieldset': { borderColor: 'rgba(34, 139, 34, 0.3)' },
                '&:hover fieldset': { borderColor: '#228B22' },
                '&.Mui-focused fieldset': { borderColor: '#32CD32' }
              },
              '& .MuiInputLabel-root': { color: 'rgba(143, 188, 143, 0.7)' },
              '& .MuiInputBase-input': { color: '#C8E6C9' }
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
                '& fieldset': { borderColor: 'rgba(34, 139, 34, 0.3)' },
                '&:hover fieldset': { borderColor: '#228B22' },
                '&.Mui-focused fieldset': { borderColor: '#32CD32' }
              },
              '& .MuiInputLabel-root': { color: 'rgba(143, 188, 143, 0.7)' },
              '& .MuiInputBase-input': { color: '#C8E6C9' }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={onClose} sx={{ color: 'rgba(143, 188, 143, 0.5)' }}>
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
  );
}

