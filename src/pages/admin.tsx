import { useState } from 'react';
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
  Button,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  useDisclosure,
  VStack,
} from '@chakra-ui/react';
import { getAllUsers, addUser, updateUserRole, UserRole } from '../data/users';

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState(getAllUsers());
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newUser, setNewUser] = useState({ email: '', password: '', role: 'ATENDIMENTO' as UserRole });

  if (!user || user.role !== 'ADMIN') {
    router.push('/');
    return null;
  }

  const handleRoleChange = (email: string, newRole: UserRole) => {
    try {
      updateUserRole(email, newRole);
      setUsers(getAllUsers());
      toast({
        title: 'Role updated successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error updating role',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleAddUser = () => {
    try {
      addUser(newUser);
      setUsers(getAllUsers());
      onClose();
      setNewUser({ email: '', password: '', role: 'ATENDIMENTO' });
      toast({
        title: 'User added successfully',
        status: 'success',
        duration: 3000,
      });
    } catch (error: any) {
      toast({
        title: 'Error adding user',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    }
  };

  return (
    <Container maxW="container.xl" py={8}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={6}>
        <Heading>User Management</Heading>
        <Button colorScheme="blue" onClick={onOpen}>Add User</Button>
      </Box>
      
      <Box overflowX="auto">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Email</Th>
              <Th>Role</Th>
            </Tr>
          </Thead>
          <Tbody>
            {users.map((user) => (
              <Tr key={user.email}>
                <Td>{user.email}</Td>
                <Td>
                  <Select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.email, e.target.value as UserRole)}
                    isDisabled={user.role === 'ADMIN'}
                  >
                    <option value="EMBASA">EMBASA</option>
                    <option value="ATENDIMENTO">ATENDIMENTO</option>
                  </Select>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New User</ModalHeader>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input 
                  value={newUser.email}
                  onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <Input 
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Role</FormLabel>
                <Select
                  value={newUser.role}
                  onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value as UserRole }))}
                >
                  <option value="EMBASA">EMBASA</option>
                  <option value="ATENDIMENTO">ATENDIMENTO</option>
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleAddUser}>
              Add
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
}