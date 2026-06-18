// Converts a File or remote image URL to a base64 string for DY Visual Search.
// 10 MB cap, strips the `data:image/...;base64,` prefix.

const MAX_BYTES = 10 * 1024 * 1024;

export async function fileToBase64(file: File): Promise<string> {
  if (file.size > MAX_BYTES) throw new Error('Image size exceeds 10MB limit');
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? '');
      const idx = result.indexOf(',');
      resolve(idx >= 0 ? result.substring(idx + 1) : result);
    };
    reader.onerror = () => reject(reader.error ?? new Error('Read failed'));
    reader.readAsDataURL(file);
  });
}

export async function urlToBase64(url: string): Promise<string> {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Failed to fetch image: ${resp.status}`);
  const blob = await resp.blob();
  if (blob.size > MAX_BYTES) throw new Error('Image size exceeds 10MB limit');
  const file = new File([blob], 'image', { type: blob.type });
  return fileToBase64(file);
}
