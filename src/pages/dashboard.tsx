import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { Box, Container } from '@chakra-ui/react';
import AtendimentoPanel from '../components/AtendimentoPanel';
import EmbasaPanel from '../components/EmbasaPanel';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <Box p={8}>Carregando...</Box>;
  }

  return (
    <Container maxW="container.xl" py={8}>
      {user.role === 'EMBASA' ? (
        <EmbasaPanel />
      ) : user.role === 'ATENDIMENTO' ? (
        <AtendimentoPanel />
      ) : null}
    </Container>
  );
}