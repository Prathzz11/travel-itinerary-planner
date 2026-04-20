import api from './api';

// For the mock environment, we simulate a delay and return fake tokens.
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const MOCK_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.fake_signature_for_mock_environment";

export const login = async (data) => {
  // In a real app, we would do:
  // return api.post('/auth/login', data);
  
  // For the mock environment:
  await delay(800);
  
  if (data.email === 'error@example.com') {
    throw new Error('Invalid credentials');
  }

  // Return mock response matching standard JWT auth format
  return {
    data: {
      token: MOCK_TOKEN,
      user: { 
        id: '1', 
        name: 'Explorer', 
        email: data.email,
        bio: 'Avid traveler and itinerary planner.',
        avatar: 'https://i.pravatar.cc/150?u=1',
        createdAt: '2025-01-15T08:00:00Z',
        role: 'admin', // Added mock role for RBAC
        preferences: { currency: 'INR', language: 'en' }
      }
    }
  };
};

export const signup = async (data) => {
  // In a real app, we would do:
  // return api.post('/auth/signup', data);

  // For the mock environment:
  await delay(800);
  return {
    data: {
      token: MOCK_TOKEN,
      user: { 
        id: '1', 
        name: data.name, 
        email: data.email,
        bio: 'Avid traveler and itinerary planner.',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=random`,
        createdAt: new Date().toISOString(),
        role: 'admin', // Added mock role for RBAC
        preferences: { currency: 'INR', language: 'en' }
      }
    }
  };
};

export const getMe = async () => {
  // In a real app: return api.get('/auth/me');

  // For the mock environment:
  await delay(400);
  // Simulate verifying the token and getting user data
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (!token) throw new Error('No token found');

  return {
    data: {
      user: { 
        id: '1', 
        name: 'Explorer', 
        email: 'user@example.com',
        bio: 'Avid traveler and itinerary planner.',
        avatar: 'https://i.pravatar.cc/150?u=1',
        createdAt: '2025-01-15T08:00:00Z',
        role: 'admin', // Added mock role for RBAC
        preferences: { currency: 'INR', language: 'en' }
      }
    }
  };
};