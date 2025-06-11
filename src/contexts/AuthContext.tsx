import { type ReactNode, useContext, createContext, useEffect, useState, useCallback } from 'react';
import type { User } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (userData?: User) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'user_data';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const clearUserData = useCallback(() => {
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
  }, []);

  const setUserData = useCallback((userData: User) => {
    setUser(userData);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
  }, []);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/me`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const userData: User = await response.json();
      setUserData(userData);
    } catch (error) {
      console.error('Error fetching current user:', error);
      clearUserData();
    }
  }, [clearUserData, setUserData]);

  useEffect(() => {
    const userData = localStorage.getItem(USER_STORAGE_KEY);
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {
        localStorage.removeItem(USER_STORAGE_KEY);
      }
    }

    fetchCurrentUser();
  }, [fetchCurrentUser]);

  useEffect(() => {
    const handleFocus = () => {
      fetchCurrentUser();
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchCurrentUser]);

  const login = useCallback(
    async (userData?: User) => {
      if (userData) {
        setUserData(userData);
      } else {
        await fetchCurrentUser();
      }
    },
    [fetchCurrentUser, setUserData]
  );

  const logout = useCallback(async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      clearUserData();
      window.location.reload();
    }
  }, [clearUserData]);

  const value = {
    user,
    isLoggedIn: user?.user_login_id !== null,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
