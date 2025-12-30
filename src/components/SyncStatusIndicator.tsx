import CloudDoneIcon from '@mui/icons-material/CloudDone';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SyncIcon from '@mui/icons-material/Sync';
import { Box, Fade, Tooltip, Typography } from '@mui/material';
import { useStatus } from '@powersync/react';
import { useEffect, useRef, useState } from 'react';

interface SyncStatusIndicatorProps {
  /**
   * Debounce delay in ms before showing the indicator.
   * Prevents flickering for quick sync operations.
   * Default: 300ms
   */
  showDelay?: number;
  /**
   * Debounce delay in ms before hiding the indicator after sync completes.
   * Shows "Synced" briefly before disappearing.
   * Default: 1500ms
   */
  hideDelay?: number;
}

type SyncState = 'idle' | 'uploading' | 'downloading' | 'both' | 'synced';

/**
 * A floating indicator that shows sync status (uploading/downloading/both).
 * Debounced to prevent flickering during rapid sync operations.
 */
export const SyncStatusIndicator = ({ showDelay = 300, hideDelay = 1500 }: SyncStatusIndicatorProps) => {
  const status = useStatus();
  const [visibleState, setVisibleState] = useState<SyncState>('idle');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isShowingRef = useRef(false);

  const isUploading = status.dataFlowStatus.uploading;
  const isDownloading = status.dataFlowStatus.downloading;
  const isSyncing = isUploading || isDownloading;
  const lastSyncedAt = status.lastSyncedAt;

  // Format the last synced time
  const formatLastSynced = () => {
    if (!lastSyncedAt) return null;
    return new Date(lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Determine current sync state
  const getCurrentState = (): SyncState => {
    if (isUploading && isDownloading) return 'both';
    if (isUploading) return 'uploading';
    if (isDownloading) return 'downloading';
    return 'idle';
  };

  const currentState = getCurrentState();

  useEffect(() => {
    // Clear pending timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (isSyncing) {
      // Clear hide timeout if we start syncing again
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }

      if (isShowingRef.current) {
        // Already showing - update immediately to new state
        timeoutRef.current = setTimeout(() => {
          setVisibleState(currentState);
        }, 0);
      } else {
        // Not showing yet - debounce before showing
        timeoutRef.current = setTimeout(() => {
          isShowingRef.current = true;
          setVisibleState(currentState);
        }, showDelay);
      }
    } else if (isShowingRef.current) {
      // Just finished syncing - show "synced" briefly then hide
      isShowingRef.current = false;

      timeoutRef.current = setTimeout(() => {
        setVisibleState('synced');
      }, 0);

      hideTimeoutRef.current = setTimeout(() => {
        setVisibleState('idle');
      }, hideDelay);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isSyncing, currentState, showDelay, hideDelay]);

  // Cleanup hide timeout on unmount
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  const getStateConfig = () => {
    switch (visibleState) {
      case 'uploading':
        return {
          icon: <CloudUploadIcon sx={{ fontSize: 18 }} />,
          label: 'Uploading',
          tooltip: 'Uploading local changes to the server',
          color: '#FFB74D'
        };
      case 'downloading':
        return {
          icon: <CloudDownloadIcon sx={{ fontSize: 18 }} />,
          label: 'Downloading',
          tooltip: 'Downloading updates from the server',
          color: '#64B5F6'
        };
      case 'both':
        return {
          icon: <SyncIcon sx={{ fontSize: 18 }} />,
          label: 'Syncing',
          tooltip: 'Uploading changes and downloading updates',
          color: '#BA68C8'
        };
      case 'synced': {
        const time = formatLastSynced();
        return {
          icon: <CloudDoneIcon sx={{ fontSize: 18 }} />,
          label: time ? `Synced at ${time}` : 'Synced',
          tooltip: time ? `All data is up to date (last sync: ${time})` : 'All data is up to date',
          color: '#81C784'
        };
      }
      default:
        return null;
    }
  };

  const config = getStateConfig();

  return (
    <Fade in={visibleState !== 'idle'} timeout={200}>
      <Box>
        <Tooltip title={config?.tooltip || ''} placement="left" arrow>
          <Box
            sx={{
              position: 'fixed',
              bottom: 100,
              right: 32,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 1,
              borderRadius: 3,
              background: 'rgba(22, 34, 22, 0.95)',
              border: `1px solid ${config?.color || '#228B22'}40`,
              boxShadow: `0 4px 12px rgba(0, 0, 0, 0.3), 0 0 20px ${config?.color || '#228B22'}20`,
              backdropFilter: 'blur(8px)',
              zIndex: 1000,
              cursor: 'default'
            }}>
            <Box
              sx={{
                color: config?.color,
                display: 'flex',
                alignItems: 'center',
                animation: visibleState !== 'synced' ? 'spin 1.5s linear infinite' : 'none',
                '@keyframes spin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' }
                }
              }}>
              {config?.icon}
            </Box>
            <Typography
              variant="body2"
              sx={{
                color: config?.color,
                fontWeight: 500,
                fontSize: '0.8rem'
              }}>
              {config?.label}
            </Typography>
          </Box>
        </Tooltip>
      </Box>
    </Fade>
  );
};

export default SyncStatusIndicator;
