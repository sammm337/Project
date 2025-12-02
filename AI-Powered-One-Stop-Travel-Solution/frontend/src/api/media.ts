import { request } from './http';

export async function uploadMedia(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  // Note: We use fetch directly here because 'request' helper might enforce JSON headers
  const response = await fetch('/api/media/upload', {
    method: 'POST',
    body: formData,
    // Do NOT set Content-Type header; fetch sets it to multipart/form-data automatically
  });

  if (!response.ok) {
    throw new Error('Upload failed');
  }

  const data = await response.json();
  return data.url;
}