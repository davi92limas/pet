/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginService, register as registerService, fetchProfile } from '@/services/auth';
import { getErrorMessage } from '@/utils/errors';
import type { AuthResponse, User } from '@/types';
import { toast } from 'sonner';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAdmin: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = '@helppet:token';
const USER_KEY = '@helppet:user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        const parsed = JSON.parse(storedUser) as User;
        setUser(parsed);
      } catch (error) {
        console.error('Erro ao ler usuário armazenado', error);
        localStorage.removeItem(USER_KEY);
      }
    }

    setLoading(false);
  }, []);

  const persistSession = ({ access_token, user: userData }: AuthResponse) => {
    localStorage.setItem(TOKEN_KEY, access_token);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setToken(access_token);
    setUser(userData);
  };

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
    navigate('/login');
  }, [navigate]);

  const login = useCallback(
    async (credentials: { email: string; password: string }) => {
      setLoading(true);
      try {
        const data = await loginService(credentials);
        persistSession(data);
        toast.success(`Bem-vindo(a), ${data.user.name}!`);
        navigate('/app');
      } catch (error) {
        toast.error(getErrorMessage(error, 'Credenciais inválidas'));
      } finally {
        setLoading(false);
      }
    },
    [navigate],
  );

  const register = useCallback(
    async (payload: { name: string; email: string; password: string }) => {
      setLoading(true);
      try {
        const data = await registerService(payload);
        persistSession(data);
        toast.success('Cadastro realizado com sucesso!');
        navigate('/app');
      } finally {
        setLoading(false);
      }
    },
    [navigate],
  );

  useEffect(() => {
    async function syncProfile() {
      if (!token) {
        return;
      }
      try {
        const profile = await fetchProfile();
        setUser(profile);
        localStorage.setItem(USER_KEY, JSON.stringify(profile));
      } catch (error) {
        console.error('Falha ao sincronizar perfil', error);
        logout();
      }
    }

    syncProfile();
  }, [logout, token]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      loading,
      isAdmin: user?.role === 'ADMIN',
      login,
      register,
      logout,
    }),
    [loading, login, logout, register, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}
