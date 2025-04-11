import { createContext, useContext, useEffect, useState } from 'react';
import { useToast } from '@chakra-ui/react';

interface User {
  id: number;
  email: string;
  role: 'ADMIN' | 'EMBASA' | 'ATENDIMENTO' | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('auth_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error('Error loading stored auth:', err);
      localStorage.removeItem('auth_user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Falha no login');
      }

      const userData = await response.json();
      setUser(userData);
      localStorage.setItem('auth_user', JSON.stringify(userData));
      
      toast({
        title: 'Login realizado com sucesso',
        description: `Bem-vindo${userData.role ? ` - ${userData.role}` : ''}`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      setError(error.message);
      toast({
        title: 'Erro ao fazer login',
        description: error.message || 'Por favor, tente novamente',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
    toast({
      title: 'Logout realizado com sucesso',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};