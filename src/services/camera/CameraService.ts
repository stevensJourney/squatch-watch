/**
 * Camera service interface for capturing photos across different platforms
 */

export interface PhotoResult {
  /** Base64-encoded image data (without data URL prefix) */
  base64Data: string;
  /** MIME type of the image */
  mimeType: string;
  /** Optional file name */
  fileName?: string;
}

export interface CameraService {
  /**
   * Check if camera is available on this platform
   */
  isAvailable(): Promise<boolean>;

  /**
   * Take a photo using the device camera
   */
  takePhoto(): Promise<PhotoResult>;

  /**
   * Pick a photo from the device gallery/file system
   */
  pickPhoto(): Promise<PhotoResult>;
}

/**
 * Generate a unique filename for an attachment
 */
export function generatePhotoFilename(extension: string = 'jpg'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `sighting-${timestamp}-${random}.${extension}`;
}

