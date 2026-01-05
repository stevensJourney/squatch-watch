import { Directory, Filesystem } from '@capacitor/filesystem';
import { AttachmentData, LocalStorageAdapter } from '@powersync/web';

const ATTACHMENTS_DIR = 'attachments';

/**
 * Capacitor implementation of LocalStorageAdapter using @capacitor/filesystem
 */
export class CapacitorLocalStorage implements LocalStorageAdapter {
  private readonly directory = Directory.Data;
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await Filesystem.mkdir({
        path: ATTACHMENTS_DIR,
        directory: this.directory,
        recursive: true
      });
    } catch (e) {
      // Directory may already exist, which is fine
    }

    this.initialized = true;
  }

  async clear(): Promise<void> {
    try {
      await Filesystem.rmdir({
        path: ATTACHMENTS_DIR,
        directory: this.directory,
        recursive: true
      });
      await this.initialize();
    } catch (e) {
      console.warn('Failed to clear attachments directory:', e);
    }
  }

  getLocalUri(filename: string): string {
    return `${ATTACHMENTS_DIR}/${filename}`;
  }

  async saveFile(filePath: string, data: AttachmentData): Promise<number> {
    let base64Data: string;
    let size: number;

    if (typeof data === 'string') {
      // Already base64 encoded
      base64Data = data;
      const binaryString = atob(data);
      size = binaryString.length;
    } else {
      // ArrayBuffer - convert to base64
      const bytes = new Uint8Array(data);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      base64Data = btoa(binary);
      size = bytes.byteLength;
    }

    await Filesystem.writeFile({
      path: filePath,
      data: base64Data,
      directory: this.directory,
      recursive: true
    });

    return size;
  }

  async readFile(filePath: string): Promise<ArrayBuffer> {
    const result = await Filesystem.readFile({
      path: filePath,
      directory: this.directory
    });

    // readFile returns base64 data when no encoding specified
    const base64Data = result.data as string;
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    return bytes.buffer;
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      await Filesystem.deleteFile({
        path: filePath,
        directory: this.directory
      });
    } catch (e) {
      // File may not exist, which is fine
      console.warn('Delete file error (may not exist):', e);
    }
  }

  async fileExists(filePath: string): Promise<boolean> {
    try {
      await Filesystem.stat({
        path: filePath,
        directory: this.directory
      });
      return true;
    } catch {
      return false;
    }
  }

  async makeDir(path: string): Promise<void> {
    try {
      await Filesystem.mkdir({
        path,
        directory: this.directory,
        recursive: true
      });
    } catch (e) {
      // Directory may already exist
    }
  }

  async rmDir(path: string): Promise<void> {
    try {
      await Filesystem.rmdir({
        path,
        directory: this.directory,
        recursive: true
      });
    } catch (e) {
      console.warn('rmDir error:', e);
    }
  }

  /**
   * Get a file:// URL for displaying an attachment
   */
  async getFileUrl(filePath: string): Promise<string> {
    try {
      const result = await Filesystem.getUri({
        path: filePath,
        directory: this.directory
      });
      return result.uri;
    } catch {
      return '';
    }
  }
}
