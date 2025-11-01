const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://tripbot-backend.onrender.com'
  : 'http://localhost:5000';

export const API_ENDPOINTS = {
  auth: {
    login: `${API_BASE_URL}/api/auth/login`,
    register: `${API_BASE_URL}/api/auth/register`,
  },
  users: {
    profile: `${API_BASE_URL}/api/users/profile`,
    preferences: `${API_BASE_URL}/api/users/preferences`,
  },
  itineraries: {
    create: `${API_BASE_URL}/api/itineraries/create`,
    list: `${API_BASE_URL}/api/itineraries`,
    details: (id: string) => `${API_BASE_URL}/api/itineraries/${id}`,
    update: (id: string) => `${API_BASE_URL}/api/itineraries/${id}`,
    delete: (id: string) => `${API_BASE_URL}/api/itineraries/${id}`,
  },
};