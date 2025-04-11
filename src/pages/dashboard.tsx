import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { Box, Container, Heading, Button } from '@chakra-ui/react';
import EmbasaPanel from '../components/EmbasaPanel';
import AtendimentoPanel from '../components/AtendimentoPanel';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  if (!user?.role) {
    return null;
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={8}>
        <Heading size="lg">
          Painel de {user.role === 'EMBASA' ? 'EMBASA' : 'Atendimento'}
        </Heading>
        <Button onClick={logout} colorScheme="gray">
          Sair
        </Button>
      </Box>

      {user.role === 'EMBASA' ? (
        <EmbasaPanel />
      ) : (
        <AtendimentoPanel />
      )}
    </Container>
  );
}