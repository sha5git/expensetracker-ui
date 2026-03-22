import axios from 'axios';
import api, { setAccessToken } from '@/api/axios';

const BASE_URL = '/api/v1';

export interface AuthUser {
  userId: number;
  username: string;
  accessToken: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string; // format: YYYY-MM-DD
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface GenericResponse {
  message: string;
  statusCode: number;
}

export const authService = {
  /**
   * Register a new user. Returns 201 — does NOT auto-login.
   */
  register: async (data: RegisterRequest): Promise<GenericResponse> => {
    const res = await axios.post<GenericResponse>(`${BASE_URL}/auth/register`, data, {
      withCredentials: true,
    });
    return res.data;
  },

  /**
   * Login. Stores access token via setAccessToken. Returns full user info.
   */
  login: async (data: LoginRequest): Promise<AuthUser> => {
    const res = await axios.post<AuthUser>(`${BASE_URL}/auth/login`, data, {
      withCredentials: true,
    });
    setAccessToken(res.data.accessToken);
    return res.data;
  },

  /**
   * Attempt silent refresh using httpOnly cookie. Returns user if successful.
   */
  refresh: async (): Promise<AuthUser | null> => {
    try {
      const res = await axios.post<AuthUser>(`${BASE_URL}/auth/refresh`, {}, {
        withCredentials: true,
      });
      setAccessToken(res.data.accessToken);
      return res.data;
    } catch {
      return null;
    }
  },

  /**
   * Logout. Clears in-memory token and calls backend to revoke all tokens.
   */
  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } finally {
      setAccessToken(null);
    }
  },
};
