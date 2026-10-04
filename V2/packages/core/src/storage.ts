import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from './firebase';
import { SITE_ROOT } from './env';

/** Uploads an image for a post and returns its public URL. */
export async function uploadImage(file: File): Promise<string> {
  const safe = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-');
  const r = ref(storage(), `${SITE_ROOT}/uploads/${Date.now()}-${safe}`);
  await uploadBytes(r, file, { contentType: file.type });
  return getDownloadURL(r);
}
