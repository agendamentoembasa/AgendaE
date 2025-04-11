import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { 
  Button, 
  Center, 
  VStack, 
  Text, 
  Heading,
  Input,
  FormControl,
  FormLabel,
  useToast,
  Box
} from '@chakra-ui/react';

export default function Home() {
  const { user, login, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const toast = useToast();

  useEffect(() => {
    if (!loading && user?.role) {
      if (user.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    }
  }, [user, loading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (error) {
      // Error is handled in AuthContext
    }
  };

  if (loading) {
    return <Center h="100vh">Carregando...</Center>;
  }

  return (
    <Center h="100vh" bg="gray.50">
      <Box p={8} borderWidth={1} borderRadius="lg" bg="white" shadow="md">
        <VStack spacing={6} as="form" onSubmit={handleLogin}>
          <Heading>Agendamento SAC</Heading>
          {!user ? (
            <>
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Digite seu email"
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Senha</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                />
              </FormControl>
              <Button
                colorScheme="blue"
                type="submit"
                width="full"
                size="lg"
              >
                Entrar
              </Button>
            </>
          ) : !user.role ? (
            <Text>Aguardando aprovação de acesso...</Text>
          ) : null}
        </VStack>
      </Box>
    </Center>
  );
}