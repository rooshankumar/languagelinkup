
import { useState, useCallback } from 'react';

interface ApiOptions {
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  token?: string;
  contentType?: string;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  success: boolean;
}

export function useApi<T>() {
  const [state, setState] = useState<ApiResponse<T>>({
    data: null,
    error: null,
    loading: false,
    success: false
  });

  const fetchData = useCallback(async ({ 
    endpoint, 
    method = 'GET', 
    body = null, 
    token = null,
    contentType = 'application/json'
  }: ApiOptions): Promise<ApiResponse<T>> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Build headers
      const headers: Record<string, string> = {
        'Content-Type': contentType,
      };
      
      // Add auth token if provided
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Build fetch options
      const options: RequestInit = {
        method,
        headers,
        credentials: 'include', // Include cookies
      };
      
      // Add body for non-GET requests if provided
      if (method !== 'GET' && body) {
        options.body = contentType === 'application/json' 
          ? JSON.stringify(body) 
          : body;
      }
      
      // Make the request
      const response = await fetch(`/api${endpoint}`, options);
      
      // Parse JSON response
      const data = await response.json();
      
      // Handle error responses
      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }
      
      // Update state with success
      setState({
        data,
        error: null,
        loading: false,
        success: true
      });
      
      return {
        data,
        error: null,
        loading: false,
        success: true
      };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      // Update state with error
      setState({
        data: null,
        error: errorMessage,
        loading: false,
        success: false
      });
      
      return {
        data: null,
        error: errorMessage,
        loading: false,
        success: false
      };
    }
  }, []);

  return {
    ...state,
    fetchData
  };
}

export default useApi;
