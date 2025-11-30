export interface RequestOptions extends RequestInit {
  mock?: boolean;
  mockResponse?: unknown;
}

const BASE_URL = import.meta.env.VITE_API_BASE ?? '';

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  if (options.mock && options.mockResponse) {
    return options.mockResponse as T;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {})
    },
    ...options
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Request failed');
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export async function requestForm<T>(path: string, body: FormData, options: RequestOptions = {}): Promise<T> {
  if (options.mock && options.mockResponse) {
    return options.mockResponse as T;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method: options.method ?? 'POST',
    body,
    ...options,
    headers: {
      ...(options.headers ?? {})
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Request failed');
  }

  return response.json();
}

