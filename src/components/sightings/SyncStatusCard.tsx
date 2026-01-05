import CloudDoneIcon from '@mui/icons-material/CloudDone';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import CloudSyncIcon from '@mui/icons-material/CloudSync';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import LogoutIcon from '@mui/icons-material/Logout';
import SyncIcon from '@mui/icons-material/Sync';
import UploadIcon from '@mui/icons-material/Upload';
import { Box, Card, CardContent, Chip, IconButton, Tooltip, Typography } from '@mui/material';
import type { SyncStatus } from '@powersync/web';

interface SyncStatusCardProps {
  status: SyncStatus;
  currentUserId: string | null;
  onSignOut: () => void;
  onSignIn: () => void;
}

function getSyncStatusInfo(status: SyncStatus) {
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
}

export function SyncStatusCard({ status, currentUserId, onSignOut, onSignIn }: SyncStatusCardProps) {
  const syncStatus = getSyncStatusInfo(status);

  return (
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

            {status.dataFlowStatus.downloadError && (
              <Tooltip title={`Download error: ${status.dataFlowStatus.downloadError.message || 'Unknown error'}`}>
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

            <Tooltip title={currentUserId ? 'Sign out' : 'Sign in to sync'}>
              <IconButton
                onClick={currentUserId ? onSignOut : onSignIn}
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
  );
}

