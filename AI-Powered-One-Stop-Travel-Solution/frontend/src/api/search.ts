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
  vendorName?: string; // Added optional fields returned by backend
  city?: string;
  date?: string;
}

// Update response interface to match backend wrapper
export interface SearchResponse {
  success: boolean;
  data: Listing[];
}

export function semanticSearch(payload: SemanticSearchInput, mock?: boolean) {
  return request<SearchResponse>('/search/semantic', {
    method: 'POST',
    body: JSON.stringify(payload),
    mock,
    // Update mock response to match real backend structure
    mockResponse: {
      success: true,
      data: [
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