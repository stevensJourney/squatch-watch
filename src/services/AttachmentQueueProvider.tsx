import { usePowerSync } from '@powersync/react';
import { AttachmentQueue, QueryResult, WatchedAttachmentItem } from '@powersync/web';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { SupabaseRemoteStorage, createLocalStorageAdapter } from './storage';
import { AttachmentQueueContext } from './useAttachmentQueue';

interface AttachmentQueueProviderProps {
  children: ReactNode;
}

export function AttachmentQueueProvider({ children }: AttachmentQueueProviderProps) {
  const powerSync = usePowerSync();
  const [attachmentQueue, setAttachmentQueue] = useState<AttachmentQueue | null>(null);

  // Use ref to track the queue for cleanup
  const queueRef = useRef<AttachmentQueue | null>(null);
  const initializingRef = useRef(false);

  useEffect(() => {
    // Prevent re-initialization
    if (initializingRef.current || queueRef.current) {
      return;
    }

    initializingRef.current = true;

    const initQueue = async () => {
      try {
        const localStorage = createLocalStorageAdapter();
        const remoteStorage = new SupabaseRemoteStorage();

        const queue = new AttachmentQueue({
          db: powerSync,
          localStorage,
          remoteStorage,
          // Watch for sightings with photo_id
          watchAttachments: (onUpdate, signal) => {
            powerSync.watch(
              'SELECT photo_id as id FROM sightings WHERE photo_id IS NOT NULL',
              [],
              {
                onResult: async (result: QueryResult) => {
                  if (signal.aborted) return;

                  const items: WatchedAttachmentItem[] =
                    result.rows?._array?.map((row: { id: string }) => ({
                      id: row.id,
                      fileExtension: 'jpeg'
                    })) ?? [];

                  await onUpdate(items);
                }
              },
              { signal }
            );
          },
          // Sync every 30 seconds
          syncIntervalMs: 30_000,
          // Throttle sync operations
          syncThrottleDuration: 1_000,
          // Download attachments from cloud
          downloadAttachments: true,
          // Keep up to 100 archived attachments
          archivedCacheLimit: 100
          // Error handler - returns boolean directly
        });

        await queue.startSync();
        queueRef.current = queue;
        setAttachmentQueue(queue);

        console.log('Attachment queue initialized');
      } catch (error) {
        console.error('Failed to initialize attachment queue:', error);
        initializingRef.current = false;
      }
    };

    initQueue();

    return () => {
      // Use ref for cleanup to get the actual queue instance
      if (queueRef.current) {
        queueRef.current.stopSync();
        queueRef.current = null;
      }
      initializingRef.current = false;
    };
  }, [powerSync]);

  // Only render children once attachment queue is ready
  if (!attachmentQueue) {
    return null;
  }

  return <AttachmentQueueContext.Provider value={attachmentQueue}>{children}</AttachmentQueueContext.Provider>;
}
