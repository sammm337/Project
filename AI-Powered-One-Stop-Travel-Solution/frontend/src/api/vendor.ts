import { request, requestForm } from './http';

export interface VendorPayload {
  name: string;
  city: string;
  story: string;
}

export interface PackagePayload {
  vendorId: string;
  title: string;
  description: string;
  price: number;
  tags: string[];
  audio?: File;
  images?: File[];
}

export interface AgentMetadata {
  title: string;
  description: string;
  tags: string[];
}

export function createVendor(payload: VendorPayload) {
  return request<{ vendorId: string }>('/api/vendor/create', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function createPackage(payload: PackagePayload) {
  if (payload.audio || payload.images) {
    const formData = new FormData();
    formData.append('vendorId', payload.vendorId);
    formData.append('title', payload.title);
    formData.append('description', payload.description);
    formData.append('price', payload.price.toString());
    formData.append('tags', JSON.stringify(payload.tags));
    if (payload.audio) formData.append('audio', payload.audio);
    payload.images?.forEach((img) => formData.append('images', img));
    return requestForm<{ listingId: string }>('/api/vendor/create-package', formData, {
      method: 'POST'
    });
  }

  return request<{ listingId: string }>('/api/vendor/create-package', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function generateMetadata(payload: { vendorId: string; listingId: string }) {
  return request<AgentMetadata>('/api/vendor/generate-metadata', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function fetchVendorPackages(vendorId: string) {
  return request<{ items: unknown[] }>(`/api/vendor/packages/${vendorId}`, {
    method: 'GET'
  });
}

