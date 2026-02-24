/**
 * Formats bytes into a human-readable string.
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Compresses an image to a target size in KB.
 */
export async function compressImageToSize(
  file: File | Blob,
  targetKB: number,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const targetBytes = targetKB * 1024;
  
  const img = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');
  ctx.drawImage(img, 0, 0);

  let bestBlob: Blob | null = null;
  let bestDiff = Infinity;

  // First, check if we can reach it just by quality
  let minQuality = 0.0;
  let maxQuality = 1.0;
  
  for (let i = 0; i < 10; i++) {
    const quality = (minQuality + maxQuality) / 2;
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), 'image/jpeg', quality)
    );

    if (!blob) continue;

    if (blob.size <= targetBytes) {
      const diff = targetBytes - blob.size;
      if (diff < bestDiff) {
        bestDiff = diff;
        bestBlob = blob;
      }
      minQuality = quality;
    } else {
      maxQuality = quality;
    }
    if (onProgress) onProgress(i * 5);
  }

  // If even at quality 0, it's too big, we must scale down
  if (!bestBlob || bestDiff > targetBytes * 0.2) {
    const minBlob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.0)
    );
    if (minBlob && minBlob.size > targetBytes) {
      let minScale = 0.1;
      let maxScale = 1.0;
      let scale = 1.0;
      
      for (let i = 0; i < 10; i++) {
        scale = (minScale + maxScale) / 2;
        const scaledCanvas = document.createElement('canvas');
        scaledCanvas.width = Math.max(1, Math.floor(img.width * scale));
        scaledCanvas.height = Math.max(1, Math.floor(img.height * scale));
        const sCtx = scaledCanvas.getContext('2d');
        sCtx?.drawImage(img, 0, 0, scaledCanvas.width, scaledCanvas.height);
        
        const blob = await new Promise<Blob | null>((resolve) =>
          scaledCanvas.toBlob((b) => resolve(b), 'image/jpeg', 0.6)
        );

        if (!blob) continue;

        if (blob.size <= targetBytes) {
          const diff = targetBytes - blob.size;
          if (diff < bestDiff) {
            bestDiff = diff;
            bestBlob = blob;
          }
          minScale = scale;
        } else {
          maxScale = scale;
        }
        if (onProgress) onProgress(50 + i * 5);
      }
    }
  }

  if (!bestBlob) {
    bestBlob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.7)
    );
  }

  if (onProgress) onProgress(100);
  return bestBlob || file;
}
