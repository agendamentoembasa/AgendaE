import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import AtendimentoPanel from '../components/AtendimentoPanel';
import EmbasaPanel from '../components/EmbasaPanel';
import {
  Box,
  Container,
  Heading,
  Button,
  VStack,
  HStack,
  useColorModeValue,
  Text,
  Flex,
  Spacer,
} from '@chakra-ui/react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const headerBgColor = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!user?.role) {
    return null;
  }

  return (
    <Box minH="100vh" bg={bgColor}>
      <Box bg={headerBgColor} py={4} px={8} shadow="sm" mb={8}>
        <Container maxW="container.xl">
          <Flex align="center">
            <VStack align="start" spacing={1}>
              <Heading size="lg" color="blue.600">
                Sistema de Agendamento SAC
              </Heading>
              <Text color="gray.600">
                {user.role === 'ADMIN' ? 'Administrador' :
                 user.role === 'EMBASA' ? 'Funcionário Embasa' :
                 'Atendente SAC'}
              </Text>
            </VStack>
            <Spacer />
            <HStack spacing={4}>
              {user.role === 'ADMIN' && (
                <Button
                  colorScheme="blue"
                  variant="outline"
                  onClick={() => router.push('/admin')}
                >
                  Painel Admin
                </Button>
              )}
              <Button onClick={handleLogout} colorScheme="red" variant="ghost">
                Sair
              </Button>
            </HStack>
          </Flex>
        </Container>
      </Box>

      <Container maxW="container.xl" pb={8}>
        {user.role === 'ATENDIMENTO' ? (
          <AtendimentoPanel />
        ) : user.role === 'EMBASA' ? (
          <EmbasaPanel />
        ) : null}
      </Container>
    </Box>
  );
}