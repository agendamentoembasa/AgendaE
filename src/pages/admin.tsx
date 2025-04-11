import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
  useToast,
  VStack,
  Text,
  useColorModeValue,
  Card,
  CardHeader,
  CardBody,
  Button,
  HStack,
  Badge,
} from '@chakra-ui/react';
import { User } from '../lib/db';

// Lista de admins que podem acessar esta página
const ADMIN_EMAILS = [
  "agendamentoembasa@gmail.com",
  "davosalm@gmail.com"
];

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const toast = useToast();
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBgColor = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    if (!user || !ADMIN_EMAILS.includes(user.email!)) {
      router.push('/');
      return;
    }
    loadUsers();
  }, [user, router]);

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (!response.ok) throw new Error('Failed to load users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      toast({
        title: 'Erro ao carregar usuários',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleRoleChange = async (email: string, newRole: string) => {
    try {
      const response = await fetch('/api/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          role: newRole || null,
        }),
      });

      if (!response.ok) throw new Error('Failed to update user role');
      
      setUsers(users.map(u => 
        u.email === email ? { ...u, role: newRole as any || null } : u
      ));

      toast({
        title: 'Função atualizada com sucesso',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Erro ao atualizar função',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const getRoleBadgeColor = (role: string | null) => {
    switch (role) {
      case 'ADMIN':
        return 'red';
      case 'EMBASA':
        return 'blue';
      case 'ATENDIMENTO':
        return 'green';
      default:
        return 'gray';
    }
  };

  return (
    <Box minH="100vh" bg={bgColor} py={8}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="stretch">
          <HStack justify="space-between">
            <Heading size="lg" color="blue.600">
              Painel Administrativo
            </Heading>
            <Button onClick={() => router.push('/dashboard')} colorScheme="blue" variant="outline">
              Voltar ao Dashboard
            </Button>
          </HStack>

          <Card bg={cardBgColor} shadow="sm" rounded="lg">
            <CardHeader>
              <Heading size="md">Gerenciamento de Usuários</Heading>
            </CardHeader>
            <CardBody>
              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Email</Th>
                      <Th>Função Atual</Th>
                      <Th>Alterar Função</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {users.map((user) => (
                      <Tr key={user.email}>
                        <Td>{user.email}</Td>
                        <Td>
                          <Badge colorScheme={getRoleBadgeColor(user.role)}>
                            {user.role || 'Sem acesso'}
                          </Badge>
                        </Td>
                        <Td>
                          <Select
                            value={user.role || ''}
                            onChange={(e) => handleRoleChange(user.email, e.target.value)}
                            bg={cardBgColor}
                          >
                            <option value="">Sem acesso</option>
                            <option value="EMBASA">EMBASA</option>
                            <option value="ATENDIMENTO">ATENDIMENTO</option>
                            {ADMIN_EMAILS.includes(user.email) && (
                              <option value="ADMIN">ADMIN</option>
                            )}
                          </Select>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
}