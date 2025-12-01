import { request } from './http';

export function travelerSearch(payload: Record<string, unknown>) {
  return request('/api/traveler/search', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function recommend(payload: { userId: string; mode: 'via_vendor' | 'via_agency' }) {
  return request<{ results: unknown[] }>('/api/traveler/recommend', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export interface ItineraryPayload {
  destination: string;
  days: number;
  budget: string;
  interests: string;
}

export function itinerary(payload: ItineraryPayload) {
  return request<{ days: unknown[] }>('/api/traveler/itinerary', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}