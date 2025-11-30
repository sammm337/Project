import { request } from './http';

interface AuthPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  userId: string;
}

export function login(payload: AuthPayload, mock?: boolean) {
  return request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
    mock,
    mockResponse: {
      token: 'mock-token',
      userId: 'user-local'
    }
  });
}

export function signup(payload: AuthPayload, mock?: boolean) {
  return request<AuthResponse>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
    mock,
    mockResponse: {
      token: 'mock-token',
      userId: 'user-local'
    }
  });
}

