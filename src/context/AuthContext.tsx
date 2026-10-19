import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import type { ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import type { User } from '../types';
import api from '../services/api';


// ------- Types -------

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  universityId: string | null;
  exp: number;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginSuccess: (token: string, user: User) => void;
  logout: () => void;
}

// ------- Context -------

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ------- Helpers -------

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

function isTokenExpired(token: string): boolean {
  try {
    const { exp } = jwtDecode<JwtPayload>(token);
    return Date.now() >= exp * 1000;
  } catch {
    return true;
  }
}

// ------- Provider -------

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, rehydrate auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    if (storedToken && storedUser && !isTokenExpired(storedToken)) {
      const parsedUser = JSON.parse(storedUser) as User;
      const handle = setTimeout(() => {
        setToken(storedToken);
        setUser(parsedUser);
        setIsLoading(false);
      }, 0);

      // Background refresh to reflect real-time university domain / bypass whitelist updates
      api.get('/auth/me')
        .then((res) => {
          if (res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem(USER_KEY, JSON.stringify(res.data.user));
          }
        })
        .catch(() => {
          // Keep stored session if offline
        });

      return () => clearTimeout(handle);
    } else {

      // Clear stale / expired data
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      const handle = setTimeout(() => {
        setIsLoading(false);
      }, 0);
      return () => clearTimeout(handle);
    }
  }, []);

  const loginSuccess = useCallback((newToken: string, newUser: User) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const value: AuthContextValue = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    loginSuccess,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ------- Hook -------

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
