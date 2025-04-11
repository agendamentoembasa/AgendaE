import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import {
  Button,
  Center,
  VStack,
  Text,
  Heading,
  Box,
  useColorModeValue,
  Container,
  Image,
} from '@chakra-ui/react';

export default function Home() {
  const { user, login, loading } = useAuth();
  const router = useRouter();
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBgColor = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    if (!loading && user?.role) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleLogin = async () => {
    try {
      // Login temporário para teste
      await login('agendamentoembasa@gmail.com', 'agendamento12');
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  if (loading) {
    return (
      <Center h="100vh" bg={bgColor}>
        <Text fontSize="lg">Carregando...</Text>
      </Center>
    );
  }

  return (
    <Box minH="100vh" bg={bgColor} py={10}>
      <Container maxW="container.md">
        <Center>
          <VStack spacing={8} w="full">
            <Box
              p={8}
              bg={cardBgColor}
              boxShadow="lg"
              rounded="xl"
              w="full"
              maxW="md"
            >
              <VStack spacing={6} align="center">
                <Image
                  src="/logo-embasa.png"
                  alt="Logo Embasa"
                  height={100}
                  width="auto"
                />
                <Heading size="lg" textAlign="center" color="blue.600">
                  Sistema de Agendamento SAC
                </Heading>
                {!user ? (
                  <VStack spacing={4} w="full">
                    <Text textAlign="center" color="gray.600">
                      Faça login para acessar o sistema de agendamentos
                    </Text>
                    <Button
                      colorScheme="blue"
                      size="lg"
                      w="full"
                      onClick={handleLogin}
                    >
                      Entrar
                    </Button>
                  </VStack>
                ) : !user.role ? (
                  <VStack spacing={4}>
                    <Text color="yellow.600" fontWeight="medium">
                      Aguardando aprovação de acesso...
                    </Text>
                    <Text color="gray.600" fontSize="sm" textAlign="center">
                      Um administrador precisa aprovar seu acesso antes que você possa utilizar o sistema.
                    </Text>
                  </VStack>
                ) : null}
              </VStack>
            </Box>
          </VStack>
        </Center>
      </Container>
    </Box>
  );
}