import { Capacitor } from '@capacitor/core';
import { CameraService, PhotoResult } from './CameraService';
import { CapacitorCameraService } from './CapacitorCameraService';
import { WebCameraService } from './WebCameraService';

/**
 * Camera service implementation that selects the platform-specific
 * camera service based on the current environment.
 */
export class CameraServiceImpl implements CameraService {
  private service: CameraService;

  constructor() {
    const isNative = Capacitor.isNativePlatform();
    this.service = isNative ? new CapacitorCameraService() : new WebCameraService();
  }

  async isAvailable(): Promise<boolean> {
    return this.service.isAvailable();
  }

  async takePhoto(): Promise<PhotoResult> {
    return this.service.takePhoto();
  }

  async pickPhoto(): Promise<PhotoResult> {
    return this.service.pickPhoto();
  }
}
