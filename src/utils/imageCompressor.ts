/**
 * CoastalGuard AI - Client Image Compression & Optimization Utility
 * Downscales high-resolution field photos (e.g., 12MP phone captures)
 * to prevent localStorage quota exhaustion and reduce API latency.
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  mimeType?: string;
}

export interface CompressedImageResult {
  dataUrl: string;
  originalSizeBytes: number;
  compressedSizeBytes: number;
  compressionRatio: number;
  mimeType: string;
}

/**
 * Resizes and compresses an image File or Data URL to optimized dimensions.
 */
export async function compressImage(
  fileOrDataUrl: File | string,
  options: CompressionOptions = {}
): Promise<CompressedImageResult> {
  const maxWidth = options.maxWidth || 1280;
  const maxHeight = options.maxHeight || 1280;
  const quality = options.quality ?? 0.8;
  const targetMime = options.mimeType || 'image/jpeg';

  // Read as Data URL first if a File object is passed
  let sourceDataUrl = '';
  let originalSizeBytes = 0;

  if (typeof fileOrDataUrl === 'string') {
    sourceDataUrl = fileOrDataUrl;
    originalSizeBytes = Math.round((fileOrDataUrl.length * 3) / 4);
  } else {
    originalSizeBytes = fileOrDataUrl.size;
    sourceDataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed reading image file.'));
      reader.readAsDataURL(fileOrDataUrl);
    });
  }

  // If in non-browser or mock environment without Image/Canvas, return safely
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return {
      dataUrl: sourceDataUrl,
      originalSizeBytes,
      compressedSizeBytes: originalSizeBytes,
      compressionRatio: 1,
      mimeType: targetMime,
    };
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      let { width, height } = img;

      // Calculate constrained dimensions preserving aspect ratio
      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, width);
      canvas.height = Math.max(1, height);

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        // Fallback to original if 2d context unavailable
        resolve({
          dataUrl: sourceDataUrl,
          originalSizeBytes,
          compressedSizeBytes: originalSizeBytes,
          compressionRatio: 1,
          mimeType: targetMime,
        });
        return;
      }

      // Smooth bicubic downsampling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      const compressedDataUrl = canvas.toDataURL(targetMime, quality);
      const compressedSizeBytes = Math.round((compressedDataUrl.length * 3) / 4);
      const compressionRatio = originalSizeBytes > 0
        ? Math.round((compressedSizeBytes / originalSizeBytes) * 100) / 100
        : 1;

      resolve({
        dataUrl: compressedDataUrl,
        originalSizeBytes,
        compressedSizeBytes,
        compressionRatio,
        mimeType: targetMime,
      });
    };

    img.onerror = () => {
      // On error, return source safely
      resolve({
        dataUrl: sourceDataUrl,
        originalSizeBytes,
        compressedSizeBytes: originalSizeBytes,
        compressionRatio: 1,
        mimeType: targetMime,
      });
    };

    img.src = sourceDataUrl;
  });
}
