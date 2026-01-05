import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { CameraService, PhotoResult, generatePhotoFilename } from './CameraService';

/**
 * Capacitor implementation of CameraService using @capacitor/camera
 */
export class CapacitorCameraService implements CameraService {
  async isAvailable(): Promise<boolean> {
    try {
      const permissions = await Camera.checkPermissions();
      // If we can check permissions, camera is available
      return permissions.camera !== 'denied' || permissions.photos !== 'denied';
    } catch {
      return false;
    }
  }

  async takePhoto(): Promise<PhotoResult> {
    const photo = await Camera.getPhoto({
      quality: 80,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera,
      correctOrientation: true
    });

    if (!photo.base64String) {
      throw new Error('Failed to capture photo');
    }

    return {
      base64Data: photo.base64String,
      mimeType: 'image/jpeg',
      fileName: generatePhotoFilename('jpeg')
    };
  }

  async pickPhoto(): Promise<PhotoResult> {
    const photo = await Camera.getPhoto({
      quality: 80,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Photos,
      correctOrientation: true
    });

    if (!photo.base64String) {
      throw new Error('Failed to pick photo');
    }

    return {
      base64Data: photo.base64String,
      mimeType: 'image/jpeg',
      fileName: generatePhotoFilename('jpeg')
    };
  }
}
