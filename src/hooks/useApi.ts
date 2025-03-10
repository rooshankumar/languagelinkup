import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface ApiOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  requireAuth?: boolean;
}

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  fetchData: (overrideOptions?: Partial<ApiOptions>) => Promise<T | null>;
}

export function useApi<T = any>(initialOptions?: Partial<ApiOptions>): ApiResponse<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { user, logout } = useAuth();

  const fetchData = useCallback(
    async (overrideOptions?: Partial<ApiOptions>): Promise<T | null> => {
      try {
        setLoading(true);
        setError(null);

        const options = {
          url: '',
          method: 'GET' as const,
          requireAuth: true,
          ...initialOptions,
          ...overrideOptions,
        };

        if (!options.url) {
          throw new Error('URL is required');
        }

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };

        // Add authorization header if required and user is logged in
        if (options.requireAuth && user?.token) {
          headers['Authorization'] = `Bearer ${user.token}`;
        } else if (options.requireAuth && !user?.token) {
          // If auth is required but no token exists, redirect to login
          logout();
          throw new Error('Authentication required');
        }

        const fetchOptions: RequestInit = {
          method: options.method,
          headers,
        };

        // Add body for non-GET requests
        if (options.method !== 'GET' && options.body) {
          fetchOptions.body = JSON.stringify(options.body);
        }

        const response = await fetch(options.url, fetchOptions);
        const responseData = await response.json();

        if (!response.ok) {
          // Handle token expiration/invalid
          if (response.status === 401 && options.requireAuth) {
            logout();
          }
          throw new Error(responseData.message || 'Something went wrong');
        }

        setData(responseData);
        return responseData;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [initialOptions, user, logout]
  );

  return { data, error, loading, fetchData };
}

export default useApi;