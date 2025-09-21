const TRUSTED_AVATAR_DOMAINS = [
  'lh3.googleusercontent.com',
  'avatars.githubusercontent.com',
  'res.cloudinary.com'
];
const MAX_BASE64_SIZE = 2 * 1024 * 1024;

export function isValidAvatarUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return TRUSTED_AVATAR_DOMAINS.some(domain => urlObj.hostname === domain);
  } catch {
    return false;
  }
}

export function validateBase64Image(base64: string): boolean {
  if (!base64.startsWith('data:image/')) {
    return false;
  }
  
  const sizeInBytes = (base64.length * 3) / 4;
  return sizeInBytes <= MAX_BASE64_SIZE;
}

export function getImageSizeFromUrl(url: string): Promise<number> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const estimatedSize = img.width * img.height * 4;
      resolve(estimatedSize);
    };
    img.onerror = () => resolve(0);
    img.src = url;
  });
}
