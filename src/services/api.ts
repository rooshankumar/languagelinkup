
import axios from 'axios';

const API_URL = '/api';

export const api = {
  auth: {
    signUp: (email: string, password: string) => 
      axios.post(`${API_URL}/auth/signup`, { email, password }),
  },
  users: {
    getProfile: () => axios.get(`${API_URL}/users/profile`),
    submitOnboarding: (data: any) => 
      axios.post(`${API_URL}/users/onboarding`, data),
  }
};

export default api;
