import { CameraService } from './CameraService';
import { CameraServiceImpl } from './CameraServiceImpl';

export * from './CameraService';
export { CameraServiceImpl } from './CameraServiceImpl';
export { CapacitorCameraService } from './CapacitorCameraService';
export { WebCameraService } from './WebCameraService';

// Singleton instance
let cameraServiceInstance: CameraServiceImpl | null = null;

/**
 * Get the singleton camera service instance
 */
export function getCameraService(): CameraService {
  if (!cameraServiceInstance) {
    cameraServiceInstance = new CameraServiceImpl();
  }
  return cameraServiceInstance;
}
