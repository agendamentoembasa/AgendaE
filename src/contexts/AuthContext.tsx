import { createContext, useContext, useEffect, useState } from 'react';
import { User, UserRole, getAllUsers, AUTH_TOKEN_KEY, initializeUsers } from '../data/users';
import { useToast } from '@chakra-ui/react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    initializeUsers();
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      const users = getAllUsers();
      const foundUser = users.find(u => u.email === token);
      if (foundUser) {
        setUser(foundUser);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const users = getAllUsers();
      const user = users.find(u => u.email === email && u.password === password);
      
      if (!user) {
        throw new Error('Invalid credentials');
      }

      setUser(user);
      localStorage.setItem(AUTH_TOKEN_KEY, user.email);
      
      toast({
        title: 'Login successful',
        status: 'success',
        duration: 3000,
      });
    } catch (error: any) {
      toast({
        title: 'Error logging in',
        description: error.message || 'Please try again',
        status: 'error',
        duration: 5000,
      });
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_TOKEN_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};