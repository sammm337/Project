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
  // Safety: If date is empty string, default to now() to prevent backend 500/400 error
  const safePayload = {
    ...payload,
    date: payload.date || new Date().toISOString()
  };

  return request('/api/events', {
    method: 'POST',
    body: JSON.stringify(safePayload)
  });
}

interface EventListEnvelope<T = unknown> {
  events?: T[];
  data?: T[];
  success?: boolean;
}

function extractEvents<T>(payload: EventListEnvelope<T> | T[] | undefined): T[] {
  if (!payload) {
    return [];
  }

  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload.events)) {
    return payload.events;
  }

  if (Array.isArray(payload.data)) {
    return payload.data;
  }

  return [];
}

export async function listEvents() {
  const response = await request<EventListEnvelope>('/api/events', {
    method: 'GET'
  });

  return {
    events: extractEvents(response)
  };
}

export function bookEvent(id: string, payload: { name: string; guests: number }) {
  return request(`/api/events/${id}/book`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function createBooking(payload: { eventId: string; userId: string }) {
  return request('/api/bookings', { 
    method: 'POST', 
    body: JSON.stringify(payload) 
  });
}