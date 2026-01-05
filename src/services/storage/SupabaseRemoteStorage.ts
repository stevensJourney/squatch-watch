import { AttachmentRecord, RemoteStorageAdapter } from '@powersync/web';
import { supabase } from '../supabase';

const STORAGE_BUCKET = 'sighting-attachments';

/**
 * Supabase implementation of RemoteStorageAdapter for cloud storage
 */
export class SupabaseRemoteStorage implements RemoteStorageAdapter {
  async uploadFile(fileData: ArrayBuffer, attachment: AttachmentRecord): Promise<void> {
    const blob = new Blob([fileData], { type: attachment.mediaType || 'application/octet-stream' });

    const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(attachment.filename, blob, {
      contentType: attachment.mediaType,
      upsert: true
    });

    if (error) {
      // Check for duplicate error (file already exists)
      if (error.message?.includes('already exists') || error.message?.includes('Duplicate')) {
        console.log(`File ${attachment.filename} already exists, skipping upload`);
        return;
      }
      throw error;
    }
  }

  async downloadFile(attachment: AttachmentRecord): Promise<ArrayBuffer> {
    const { data, error } = await supabase.storage.from(STORAGE_BUCKET).download(attachment.filename);

    if (error) {
      throw error;
    }

    return data.arrayBuffer();
  }

  async deleteFile(attachment: AttachmentRecord): Promise<void> {
    const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([attachment.filename]);

    if (error) {
      // Don't throw if file doesn't exist
      if (!error.message?.includes('not found') && !error.message?.includes('404')) {
        throw error;
      }
    }
  }
}
