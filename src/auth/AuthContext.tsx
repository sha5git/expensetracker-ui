import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { authService, type AuthUser, type LoginRequest, type RegisterRequest } from './authService';
import { setOnSessionExpired } from '@/api/axios';

interface AuthContextValue {
  user: Omit<AuthUser, 'accessToken'> | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Omit<AuthUser, 'accessToken'> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // useRef guard ensures the refresh API is called exactly once even under React
  // StrictMode, which deliberately double-invokes effects in development.
  const didRestoreRef = useRef(false);

  useEffect(() => {
    // Register the global interceptor callback to clear user state if a background refresh fails
    setOnSessionExpired(() => {
      setUser(null);
    });

    if (didRestoreRef.current) return; // already ran — skip second StrictMode call
    didRestoreRef.current = true;

    const restoreSession = async () => {
      const authUser = await authService.refresh();
      if (authUser) {
        setUser({ userId: authUser.userId, username: authUser.username });
      }
      setIsLoading(false);
    };
    restoreSession();
  }, []);

  const login = useCallback(async (data: LoginRequest) => {
    const authUser = await authService.login(data);
    setUser({ userId: authUser.userId, username: authUser.username });
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    await authService.register(data);
    // Do NOT auto-login after registration
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.warn('Backend logout failed or was already unauthorized', err);
    } finally {
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
