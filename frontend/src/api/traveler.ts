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
    body: JSON.stringify(payload),
    mock: true,
    mockResponse: {
      results: [
        {
          id: 'rec-1',
          title: 'Backwater Kayak & Malabar Brunch',
          reason: 'Because you booked slow water experiences last winter',
          price: '₹3,800',
          tags: ['Backwater', 'Food'],
          images: ['/assets/placeholder.svg']
        }
      ]
    }
  });
}

export function itinerary(payload: { userId: string; selectionId: string; nights: number }) {
  return request<{ days: unknown[] }>('/api/traveler/itinerary', {
    method: 'POST',
    body: JSON.stringify(payload),
    mock: true,
    mockResponse: {
      days: [
        {
          day: 1,
          title: 'Arrival & Spice Walk',
          blocks: [
            { time: '08:00', activity: 'Check-in with host', location: 'Village homestay' },
            { time: '11:00', activity: 'Spice plantation walk', location: 'River bend' }
          ]
        }
      ]
    }
  });
}

