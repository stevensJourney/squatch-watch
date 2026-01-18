import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import CloudSyncIcon from '@mui/icons-material/CloudSync';
import DownloadIcon from '@mui/icons-material/Download';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import StorageIcon from '@mui/icons-material/Storage';
import SyncIcon from '@mui/icons-material/Sync';
import UploadIcon from '@mui/icons-material/Upload';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    LinearProgress,
    Typography,
} from '@mui/material';
import { useStatus } from '@powersync/react';
import { ReactNode } from 'react';

interface SyncDiagnosticsDialogProps {
  open: boolean;
  onClose: () => void;
}

interface StatusRowProps {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  color?: string;
}

function StatusRow({ icon, label, value, color = 'rgba(200, 230, 201, 0.8)' }: StatusRowProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        py: 1.5,
        borderBottom: '1px solid rgba(34, 139, 34, 0.1)',
        '&:last-child': { borderBottom: 'none' },
      }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ color: 'rgba(143, 188, 143, 0.6)', display: 'flex' }}>{icon}</Box>
        <Typography sx={{ color: 'rgba(143, 188, 143, 0.7)', fontSize: '0.9rem' }}>{label}</Typography>
      </Box>
      <Box sx={{ color, fontWeight: 500, fontSize: '0.9rem' }}>{value}</Box>
    </Box>
  );
}

export function SyncDiagnosticsDialog({ open, onClose }: SyncDiagnosticsDialogProps) {
  const status = useStatus();

  // Connection status
  const getConnectionStatus = () => {
    if (!status.connected) {
      return {
        icon: <CloudOffIcon />,
        label: 'Disconnected',
        color: '#CD5C5C',
        description: 'Not connected to PowerSync service',
      };
    }

    if (status.dataFlowStatus.downloading) {
      return {
        icon: <CloudSyncIcon />,
        label: 'Syncing',
        color: '#64B5F6',
        description: 'Downloading changes from server',
      };
    }

    if (status.dataFlowStatus.uploading) {
      return {
        icon: <UploadIcon />,
        label: 'Uploading',
        color: '#FFB74D',
        description: 'Uploading local changes',
      };
    }

    return {
      icon: <CloudDoneIcon />,
      label: 'Connected',
      color: '#81C784',
      description: 'All data synced',
    };
  };

  const connectionStatus = getConnectionStatus();

  // Format timestamp
  const formatTime = (date: Date | null | undefined) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleString();
  };

  // Format relative time
  const formatRelativeTime = (date: Date | null | undefined) => {
    if (!date) return '';
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 60) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          background: 'linear-gradient(180deg, #1a2f1a 0%, #0d1a0d 100%)',
          border: '1px solid rgba(34, 139, 34, 0.3)',
          maxHeight: '80vh',
        },
      }}>
      <DialogTitle
        sx={{
          color: '#8FBC8F',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          pb: 1,
        }}>
        <SyncIcon />
        Sync Diagnostics
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        {/* Connection Status Banner */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: 2,
            mb: 2,
            borderRadius: 2,
            background: `${connectionStatus.color}15`,
            border: `1px solid ${connectionStatus.color}40`,
          }}>
          <Box sx={{ color: connectionStatus.color, display: 'flex' }}>{connectionStatus.icon}</Box>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ color: connectionStatus.color, fontWeight: 600 }}>{connectionStatus.label}</Typography>
            <Typography sx={{ color: 'rgba(200, 230, 201, 0.6)', fontSize: '0.85rem' }}>
              {connectionStatus.description}
            </Typography>
          </Box>
          {(status.dataFlowStatus.downloading || status.dataFlowStatus.uploading) && (
            <Box sx={{ width: 60 }}>
              <LinearProgress
                sx={{
                  background: 'rgba(255,255,255,0.1)',
                  '& .MuiLinearProgress-bar': { background: connectionStatus.color },
                }}
              />
            </Box>
          )}
        </Box>

        {/* Quick Stats */}
        <Box sx={{ mb: 2 }}>
          <StatusRow
            icon={<StorageIcon fontSize="small" />}
            label="Last Sync"
            value={
              <Box sx={{ textAlign: 'right' }}>
                <Typography sx={{ fontSize: '0.9rem', color: '#C8E6C9' }}>
                  {formatRelativeTime(status.lastSyncedAt)}
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: 'rgba(143, 188, 143, 0.5)' }}>
                  {formatTime(status.lastSyncedAt)}
                </Typography>
              </Box>
            }
          />
        </Box>

        <Divider sx={{ borderColor: 'rgba(34, 139, 34, 0.2)', my: 2 }} />

        {/* Data Flow Section */}
        <Accordion
          defaultExpanded
          sx={{
            background: 'rgba(22, 34, 22, 0.5)',
            border: '1px solid rgba(34, 139, 34, 0.15)',
            '&:before': { display: 'none' },
            boxShadow: 'none',
          }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: 'rgba(143, 188, 143, 0.6)' }} />}
            sx={{ '& .MuiAccordionSummary-content': { my: 1 } }}>
            <Typography sx={{ color: '#8FBC8F', fontWeight: 500 }}>Data Flow Status</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 0 }}>
            {/* Download Status */}
            <StatusRow
              icon={<DownloadIcon fontSize="small" />}
              label="Download"
              value={
                status.dataFlowStatus.downloading ? (
                  <Chip
                    label="Downloading..."
                    size="small"
                    sx={{
                      background: 'rgba(100, 181, 246, 0.2)',
                      color: '#64B5F6',
                      border: '1px solid rgba(100, 181, 246, 0.4)',
                      height: 24,
                    }}
                  />
                ) : (
                  <Chip
                    icon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
                    label="Idle"
                    size="small"
                    sx={{
                      background: 'rgba(129, 199, 132, 0.2)',
                      color: '#81C784',
                      border: '1px solid rgba(129, 199, 132, 0.4)',
                      height: 24,
                      '& .MuiChip-icon': { color: '#81C784' },
                    }}
                  />
                )
              }
            />

            {/* Upload Status */}
            <StatusRow
              icon={<UploadIcon fontSize="small" />}
              label="Upload"
              value={
                status.dataFlowStatus.uploading ? (
                  <Chip
                    label="Uploading..."
                    size="small"
                    sx={{
                      background: 'rgba(255, 183, 77, 0.2)',
                      color: '#FFB74D',
                      border: '1px solid rgba(255, 183, 77, 0.4)',
                      height: 24,
                    }}
                  />
                ) : (
                  <Chip
                    icon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
                    label="Idle"
                    size="small"
                    sx={{
                      background: 'rgba(129, 199, 132, 0.2)',
                      color: '#81C784',
                      border: '1px solid rgba(129, 199, 132, 0.4)',
                      height: 24,
                      '& .MuiChip-icon': { color: '#81C784' },
                    }}
                  />
                )
              }
            />
          </AccordionDetails>
        </Accordion>

        {/* Errors Section */}
        {(status.dataFlowStatus.downloadError || status.dataFlowStatus.uploadError) && (
          <Accordion
            defaultExpanded
            sx={{
              mt: 1,
              background: 'rgba(205, 92, 92, 0.1)',
              border: '1px solid rgba(205, 92, 92, 0.3)',
              '&:before': { display: 'none' },
              boxShadow: 'none',
            }}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: '#CD5C5C' }} />}
              sx={{ '& .MuiAccordionSummary-content': { my: 1 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ErrorOutlineIcon sx={{ color: '#CD5C5C', fontSize: 20 }} />
                <Typography sx={{ color: '#CD5C5C', fontWeight: 500 }}>Errors</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              {status.dataFlowStatus.downloadError && (
                <Box sx={{ mb: 2 }}>
                  <Typography sx={{ color: '#CD5C5C', fontWeight: 500, fontSize: '0.85rem', mb: 0.5 }}>
                    Download Error
                  </Typography>
                  <Typography
                    sx={{
                      color: 'rgba(200, 230, 201, 0.7)',
                      fontSize: '0.85rem',
                      background: 'rgba(0,0,0,0.2)',
                      p: 1,
                      borderRadius: 1,
                      fontFamily: 'monospace',
                      wordBreak: 'break-word',
                    }}>
                    {status.dataFlowStatus.downloadError.message || 'Unknown error'}
                  </Typography>
                </Box>
              )}

              {status.dataFlowStatus.uploadError && (
                <Box>
                  <Typography sx={{ color: '#CD5C5C', fontWeight: 500, fontSize: '0.85rem', mb: 0.5 }}>
                    Upload Error
                  </Typography>
                  <Typography
                    sx={{
                      color: 'rgba(200, 230, 201, 0.7)',
                      fontSize: '0.85rem',
                      background: 'rgba(0,0,0,0.2)',
                      p: 1,
                      borderRadius: 1,
                      fontFamily: 'monospace',
                      wordBreak: 'break-word',
                    }}>
                    {status.dataFlowStatus.uploadError.message || 'Unknown error'}
                  </Typography>
                </Box>
              )}
            </AccordionDetails>
          </Accordion>
        )}

        {/* Connection Details */}
        <Accordion
          sx={{
            mt: 1,
            background: 'rgba(22, 34, 22, 0.5)',
            border: '1px solid rgba(34, 139, 34, 0.15)',
            '&:before': { display: 'none' },
            boxShadow: 'none',
          }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: 'rgba(143, 188, 143, 0.6)' }} />}
            sx={{ '& .MuiAccordionSummary-content': { my: 1 } }}>
            <Typography sx={{ color: '#8FBC8F', fontWeight: 500 }}>Connection Details</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 0 }}>
            <StatusRow
              icon={<WifiOffIcon fontSize="small" />}
              label="Connected"
              value={
                <Chip
                  label={status.connected ? 'Yes' : 'No'}
                  size="small"
                  sx={{
                    background: status.connected ? 'rgba(129, 199, 132, 0.2)' : 'rgba(205, 92, 92, 0.2)',
                    color: status.connected ? '#81C784' : '#CD5C5C',
                    border: `1px solid ${status.connected ? 'rgba(129, 199, 132, 0.4)' : 'rgba(205, 92, 92, 0.4)'}`,
                    height: 24,
                  }}
                />
              }
            />

            <StatusRow
              icon={<CloudSyncIcon fontSize="small" />}
              label="Has Synced"
              value={
                <Chip
                  label={status.hasSynced ? 'Yes' : 'No'}
                  size="small"
                  sx={{
                    background: status.hasSynced ? 'rgba(129, 199, 132, 0.2)' : 'rgba(255, 183, 77, 0.2)',
                    color: status.hasSynced ? '#81C784' : '#FFB74D',
                    border: `1px solid ${status.hasSynced ? 'rgba(129, 199, 132, 0.4)' : 'rgba(255, 183, 77, 0.4)'}`,
                    height: 24,
                  }}
                />
              }
            />
          </AccordionDetails>
        </Accordion>

        {/* Help Text */}
        <Box
          sx={{
            mt: 2,
            p: 1.5,
            background: 'rgba(34, 139, 34, 0.1)',
            borderRadius: 1,
            border: '1px solid rgba(34, 139, 34, 0.15)',
          }}>
          <Typography sx={{ color: 'rgba(143, 188, 143, 0.6)', fontSize: '0.8rem', lineHeight: 1.5 }}>
            💡 <strong>Tip:</strong> Your data is always saved locally first. Changes sync automatically when you have an
            internet connection. This status updates in real-time.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button
          onClick={onClose}
          sx={{
            color: '#8FBC8F',
            '&:hover': { background: 'rgba(34, 139, 34, 0.1)' },
          }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
