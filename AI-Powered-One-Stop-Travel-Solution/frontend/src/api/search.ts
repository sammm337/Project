import { request } from './http';

export interface SemanticSearchInput {
  q: string;
  filters: Record<string, unknown>;
  mode: 'via_vendor' | 'via_agency';
}

export interface Listing {
  id: string;
  title: string;
  price: number;
  images: string[];
  tags: string[];
  score: number;
  description: string;
}

export function semanticSearch(payload: SemanticSearchInput, mock?: boolean) {
  return request<{ results: Listing[] }>('/search/semantic', {
    method: 'POST',
    body: JSON.stringify(payload),
    mock,
    mockResponse: {
      results: [
        {
          id: 'mock-1',
          title: 'Coastal Foraging Walk',
          price: 3100,
          images: ['/assets/placeholder.svg'],
          tags: ['Seafood', 'Community'],
          score: 0.84,
          description: 'Forage kokum, seaweed, and shellfish with fisherwomen cooperatives.'
        }
      ]
    }
  });
}

export function getListings(params: Record<string, string>) {
  const query = new URLSearchParams(params).toString();
  return request<{ items: Listing[] }>(`/api/listings?${query}`, { method: 'GET' });
}

export function getListing(id: string) {
  return request<Listing>(`/api/listings/${id}`, { method: 'GET' });
}

