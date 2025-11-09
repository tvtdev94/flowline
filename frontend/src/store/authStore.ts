import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

interface AuthState {
  token: string | null;
  user: {
    id: string;
    email: string;
    name: string;
    picture?: string;
  } | null;
  isAuthenticated: boolean;

  // Actions
  login: (idToken: string) => Promise<boolean>;
  logout: () => void;
  setAuth: (token: string, user: any) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      login: async (idToken: string) => {
        try {
          const response = await api.post('/api/auth/google', { idToken });
          const { token, user } = response.data;

          set({
            token,
            user,
            isAuthenticated: true,
          });

          // Set token in axios default headers
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          return true;
        } catch (error) {
          console.error('Login failed:', error);
          return false;
        }
      },

      logout: () => {
        set({
          token: null,
          user: null,
          isAuthenticated: false,
        });

        // Remove token from axios headers
        delete api.defaults.headers.common['Authorization'];
      },

      setAuth: (token: string, user: any) => {
        set({
          token,
          user,
          isAuthenticated: true,
        });

        // Set token in axios default headers
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      },
    }),
    {
      name: 'flowline-auth',
    }
  )
);
