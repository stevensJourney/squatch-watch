import type { AttachmentQueue } from '@powersync/web';
import { createContext, useContext, useEffect, useState } from 'react';

export const AttachmentQueueContext = createContext<AttachmentQueue | null>(null);

/**
 * Hook to access the attachment queue
 */
export function useAttachmentQueue(): AttachmentQueue {
  const attachmentQueue = useContext(AttachmentQueueContext);
  if (!attachmentQueue) {
    throw new Error('useAttachmentQueue must be used within AttachmentQueueProvider');
  }
  return attachmentQueue;
}

/**
 * Hook to get a photo URL from a local URI
 * Reads from localStorage and creates a blob URL
 */
export function usePhotoUrl(localUri: string | null): {
  url: string | null;
  loading: boolean;
} {
  const attachmentQueue = useAttachmentQueue();
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(!!localUri);

  useEffect(() => {
    let mounted = true;
    let objectUrl: string | null = null;

    const loadPhoto = async () => {
      if (!localUri) {
        setLoading(false);
        return;
      }

      try {
        // Read file from localStorage adapter
        const data = await attachmentQueue.localStorage.readFile(localUri);
        if (!mounted) return;

        // Create blob URL from the data
        const blob = new Blob([data], { type: 'image/jpeg' });
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      } catch (error) {
        console.warn('Failed to load photo:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadPhoto();

    return () => {
      mounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [attachmentQueue, localUri]);

  return { url, loading };
}
