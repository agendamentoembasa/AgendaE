import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { Button, Center, VStack, Text, Heading } from '@chakra-ui/react';

export default function Home() {
  const { user, signInWithGoogle, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user?.role) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return <Center h="100vh">Carregando...</Center>;
  }

  return (
    <Center h="100vh" bg="gray.50">
      <VStack spacing={6}>
        <Heading>Agendamento SAC</Heading>
        {!user ? (
          <Button
            colorScheme="blue"
            onClick={signInWithGoogle}
            size="lg"
          >
            Entrar com Google
          </Button>
        ) : !user.role ? (
          <Text>Aguardando aprovação de acesso...</Text>
        ) : null}
      </VStack>
    </Center>
  );
}