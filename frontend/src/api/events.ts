import { request } from './http';

export interface EventInput {
  title: string;
  date: string;
  capacity: number;
  price: number;
  city: string;
  tags: string[];
}

export function createEvent(payload: EventInput) {
  return request('/api/events', {
    method: 'POST',
    body: JSON.stringify(payload),
    mock: true,
    mockResponse: { eventId: `evt-${Date.now()}` }
  });
}

export function listEvents() {
  return request<{ events: unknown[] }>('/api/events', {
    method: 'GET',
    mock: true,
    mockResponse: {
      events: [
        {
          id: 'evt-1',
          title: 'Panjim jazz crawl',
          city: 'Goa',
          date: new Date().toISOString(),
          price: 3200,
          summary: 'Live music across waterfront speakeasies with local chefs.',
          tags: ['Music', 'Food']
        }
      ]
    }
  });
}

export function bookEvent(id: string, payload: { name: string; guests: number }) {
  return request(`/api/events/${id}/book`, {
    method: 'POST',
    body: JSON.stringify(payload),
    mock: true,
    mockResponse: { ok: true }
  });
}

export function createBooking(payload: { eventId: string; userId: string }) {
  return request('/api/bookings', { method: 'POST', body: JSON.stringify(payload) });
}

