import { CameraService, PhotoResult, generatePhotoFilename } from './CameraService';

/**
 * Web implementation of CameraService using browser APIs
 */
export class WebCameraService implements CameraService {
  async isAvailable(): Promise<boolean> {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return false;
    }
    return true;
  }

  async takePhoto(): Promise<PhotoResult> {
    // Use getUserMedia to capture from camera
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('Camera not supported on this browser');
    }

    return new Promise((resolve, reject) => {
      // Create modal overlay
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        z-index: 10000;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      `;

      const video = document.createElement('video');
      video.autoplay = true;
      video.playsInline = true;
      video.style.cssText = `
        max-width: 100%;
        max-height: 70vh;
        border-radius: 8px;
      `;

      const buttonContainer = document.createElement('div');
      buttonContainer.style.cssText = `
        display: flex;
        gap: 16px;
        margin-top: 20px;
      `;

      const captureButton = document.createElement('button');
      captureButton.textContent = '📸 Capture';
      captureButton.style.cssText = `
        padding: 12px 32px;
        font-size: 18px;
        background: #4CAF50;
        color: white;
        border: none;
        border-radius: 24px;
        cursor: pointer;
      `;

      const cancelButton = document.createElement('button');
      cancelButton.textContent = 'Cancel';
      cancelButton.style.cssText = `
        padding: 12px 32px;
        font-size: 18px;
        background: #666;
        color: white;
        border: none;
        border-radius: 24px;
        cursor: pointer;
      `;

      buttonContainer.appendChild(captureButton);
      buttonContainer.appendChild(cancelButton);
      overlay.appendChild(video);
      overlay.appendChild(buttonContainer);
      document.body.appendChild(overlay);

      let stream: MediaStream | null = null;

      const cleanup = () => {
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }
        overlay.remove();
      };

      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: 'environment' } })
        .then((mediaStream) => {
          stream = mediaStream;
          video.srcObject = stream;
        })
        .catch((err) => {
          cleanup();
          reject(new Error(`Camera access denied: ${err.message}`));
        });

      captureButton.onclick = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          cleanup();
          reject(new Error('Failed to create canvas context'));
          return;
        }

        ctx.drawImage(video, 0, 0);
        cleanup();

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to capture photo'));
              return;
            }

            const reader = new FileReader();
            reader.onload = () => {
              const base64 = (reader.result as string).split(',')[1];
              resolve({
                base64Data: base64,
                mimeType: 'image/jpeg',
                fileName: generatePhotoFilename('jpeg')
              });
            };
            reader.onerror = () => reject(new Error('Failed to read photo'));
            reader.readAsDataURL(blob);
          },
          'image/jpeg',
          0.9
        );
      };

      cancelButton.onclick = () => {
        cleanup();
        reject(new Error('Photo capture cancelled'));
      };
    });
  }

  async pickPhoto(): Promise<PhotoResult> {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/jpeg';

      input.onchange = async (event) => {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];

        if (!file) {
          reject(new Error('No file selected'));
          return;
        }

        try {
          const base64Data = await this.fileToBase64(file);

          resolve({
            base64Data,
            mimeType: 'image/jpeg',
            fileName: generatePhotoFilename('jpeg')
          });
        } catch (error) {
          reject(error);
        }
      };

      input.oncancel = () => {
        reject(new Error('Photo selection cancelled'));
      };

      input.click();
    });
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}
