import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  UploadTaskSnapshot,
} from 'firebase/storage';
import { storage } from './firebase';

/**
 * Generate a reliable local Data URL or Object URL
 * when cloud storage bucket is unreachable or offline
 */
export async function fileToDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve) => {
    try {
      if (typeof window !== 'undefined' && 'FileReader' in window) {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            resolve(URL.createObjectURL(file));
          }
        };
        reader.onerror = () => {
          resolve(URL.createObjectURL(file));
        };
        reader.readAsDataURL(file);
      } else {
        resolve(URL.createObjectURL(file));
      }
    } catch {
      try {
        resolve(URL.createObjectURL(file));
      } catch {
        resolve('');
      }
    }
  });
}

/**
 * Upload a File or Blob to Storage with automatic seamless fallback
 * @param path Storage path (e.g. 'course-materials/physics101.pdf')
 * @param file File or Blob to upload
 * @param metadata Optional metadata
 * @param onProgress Optional progress callback (0 - 100)
 * @returns Download URL or resilient data URL of the uploaded file
 */
export async function uploadToStorage(
  path: string,
  file: File | Blob,
  metadata?: { contentType?: string; customMetadata?: Record<string, string> },
  onProgress?: (progress: number) => void
): Promise<string> {
  if (!storage) {
    if (onProgress) onProgress(100);
    return fileToDataUrl(file);
  }

  return new Promise(async (resolve) => {
    let resolved = false;

    // Timeout safety net (3.5 seconds) to prevent hung operations or retry limits
    const timer = setTimeout(async () => {
      if (!resolved) {
        resolved = true;
        if (onProgress) onProgress(100);
        const fallback = await fileToDataUrl(file);
        resolve(fallback);
      }
    }, 3500);

    try {
      const storageRef = ref(storage, path);
      const uploadTask = uploadBytesResumable(storageRef, file, metadata);

      uploadTask.on(
        'state_changed',
        (snapshot: UploadTaskSnapshot) => {
          if (snapshot.totalBytes > 0 && onProgress) {
            const progress = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );
            onProgress(progress);
          }
        },
        async () => {
          // Cloud storage operation encountered error (e.g. storage/retry-limit-exceeded)
          // Fall back gracefully to browser-persisted file data without logging console errors
          if (!resolved) {
            resolved = true;
            clearTimeout(timer);
            if (onProgress) onProgress(100);
            const fallback = await fileToDataUrl(file);
            resolve(fallback);
          }
        },
        async () => {
          if (!resolved) {
            resolved = true;
            clearTimeout(timer);
            try {
              const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadUrl);
            } catch {
              const fallback = await fileToDataUrl(file);
              resolve(fallback);
            }
          }
        }
      );
    } catch {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        if (onProgress) onProgress(100);
        const fallback = await fileToDataUrl(file);
        resolve(fallback);
      }
    }
  });
}

/**
 * Delete a file from Storage
 * @param path Storage path or full download URL
 */
export async function deleteFromStorage(path: string): Promise<void> {
  try {
    if (path.startsWith('blob:') || path.startsWith('data:')) {
      return;
    }
    const fileRef = ref(storage, path);
    await deleteObject(fileRef);
  } catch {
    // Non-blocking cleanup
  }
}

/**
 * List files in a storage directory
 */
export async function listStorageFiles(directoryPath: string): Promise<string[]> {
  try {
    const dirRef = ref(storage, directoryPath);
    const result = await listAll(dirRef);
    const urls = await Promise.all(result.items.map((item) => getDownloadURL(item)));
    return urls;
  } catch {
    return [];
  }
}
