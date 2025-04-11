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
} from '@chakra-ui/react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

interface User {
  id: string;
  email: string;
  role: string | null;
}

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

  useEffect(() => {
    if (!user || !ADMIN_EMAILS.includes(user.email!)) {
      router.push('/');
      return;
    }
    loadUsers();
  }, [user, router]);

  const loadUsers = async () => {
    const querySnapshot = await getDocs(collection(db, 'users'));
    const usersData: User[] = [];
    querySnapshot.forEach((doc) => {
      usersData.push({
        id: doc.id,
        ...doc.data()
      } as User);
    });
    setUsers(usersData);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        role: newRole || null
      });
      
      setUsers(users.map(u => 
        u.id === userId ? { ...u, role: newRole || null } : u
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

  return (
    <Container maxW="container.xl" py={8}>
      <Heading mb={6}>Gerenciamento de Usuários</Heading>
      <Box overflowX="auto">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Email</Th>
              <Th>Função</Th>
            </Tr>
          </Thead>
          <Tbody>
            {users.map((user) => (
              <Tr key={user.id}>
                <Td>{user.email}</Td>
                <Td>
                  <Select
                    value={user.role || ''}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  >
                    <option value="">Sem acesso</option>
                    <option value="EMBASA">EMBASA</option>
                    <option value="ATENDIMENTO">ATENDIMENTO</option>
                  </Select>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Container>
  );
}