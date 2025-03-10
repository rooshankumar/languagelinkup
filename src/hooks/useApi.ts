import { useState } from 'react';
import { toast } from './use-toast';

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

interface ApiOptions {
  headers?: Record<string, string>;
  withCredentials?: boolean;
}

const API_URL = '/api';

function useApi() {
  const [loading, setLoading] = useState(false);

  const request = async <T>(
    endpoint: string,
    method: string = 'GET',
    body?: any,
    options: ApiOptions = {}
  ): Promise<ApiResponse<T>> => {
    try {
      setLoading(true);

      const token = localStorage.getItem('token');

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers
      };

      // Add authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        credentials: 'include', // Always include credentials for cookies
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      return { data, error: null, loading: false };
    } catch (error: any) {
      console.error(`API Error (${endpoint}):`, error);
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
      return { data: null, error: error.message, loading: false };
    } finally {
      setLoading(false);
    }
  };

  const get = <T>(endpoint: string, options?: ApiOptions) => 
    request<T>(endpoint, 'GET', undefined, options);

  const post = <T>(endpoint: string, body: any, options?: ApiOptions) => 
    request<T>(endpoint, 'POST', body, options);

  const put = <T>(endpoint: string, body: any, options?: ApiOptions) => 
    request<T>(endpoint, 'PUT', body, options);

  const del = <T>(endpoint: string, options?: ApiOptions) => 
    request<T>(endpoint, 'DELETE', undefined, options);

  return {
    get,
    post,
    put,
    del,
    loading
  };
}

export default useApi;