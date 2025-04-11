import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../config/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useToast } from '@chakra-ui/react';

type UserRole = 'EMBASA' | 'ATENDIMENTO';

interface AuthUser {
  uid: string;
  email: string | null;
  role: UserRole | null;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      try {
        if (user) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          const role = userDoc.exists() ? userDoc.data().role : null;
          
          setUser({
            uid: user.uid,
            email: user.email,
            role: role,
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        toast({
          title: 'Erro ao carregar dados do usuário',
          description: 'Por favor, tente novamente mais tarde',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [toast]);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', result.user.uid), {
          email: result.user.email,
          role: null
        });
      }
    } catch (error: any) {
      console.error('Erro ao fazer login:', error);
      let errorMessage = 'Erro ao fazer login. Por favor, tente novamente.';
      
      if (error.code === 'auth/unauthorized-domain') {
        errorMessage = 'Este domínio não está autorizado para login. Por favor, contate o administrador.';
      } else if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Login cancelado. Por favor, tente novamente.';
      }

      toast({
        title: 'Erro de autenticação',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast({
        title: 'Erro ao fazer logout',
        description: 'Por favor, tente novamente',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout }}>
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