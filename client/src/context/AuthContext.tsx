import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authAPI } from '../services/api';
import { User, AuthContextValue } from '../types';

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? (JSON.parse(stored) as User) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      // Always verify the token on startup so the dashboard never renders with
      // an expired token. The axios interceptor will refresh it automatically
      // if needed before getMe() resolves.
      authAPI
        .getMe()
        .then(({ data }) => {
          const u = data.user as User;
          setUser(u);
          localStorage.setItem('user', JSON.stringify(u));
        })
        .catch(() => {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setUser(null);
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem('accessToken', data.accessToken as string);
    localStorage.setItem('refreshToken', data.refreshToken as string);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user as User);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const { data } = await authAPI.register({ name, email, password });
    localStorage.setItem('accessToken', data.accessToken as string);
    localStorage.setItem('refreshToken', data.refreshToken as string);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user as User);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
