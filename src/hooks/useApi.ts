import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from './api'; // Import the new axios instance

interface ApiOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
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
  const { logout } = useAuth();

  const fetchData = useCallback(
    async (overrideOptions?: Partial<ApiOptions>): Promise<T | null> => {
      try {
        setLoading(true);
        setError(null);

        const options = {
          url: '',
          method: 'GET',
          ...initialOptions,
          ...overrideOptions,
        };

        if (!options.url) {
          throw new Error('URL is required');
        }

        let axiosOptions = {
          method: options.method,
          url: options.url,
        };

        if(options.body){
          axiosOptions.data = options.body;
        }


        const response = await api(axiosOptions);
        setData(response.data);
        return response.data;
      } catch (err:any) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(errorMessage);
        // Handle 401 unauthorized specifically
        if (err.response && err.response.status === 401) {
          logout();
        }
        return null;
      } finally {
        setLoading(false);
      }
    },
    [initialOptions, logout]
  );

  return { data, error, loading, fetchData };
}

export default useApi;