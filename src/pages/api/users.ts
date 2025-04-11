import type { NextApiRequest, NextApiResponse } from 'next';
import { getAllUsers, createUser, updateUserRole, UserRole } from '../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      try {
        const users = await getAllUsers();
        // Remove password from response
        const sanitizedUsers = users.map(({ password, ...user }) => user);
        res.status(200).json(sanitizedUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
      break;

    case 'POST':
      try {
        const { email, password, role } = req.body;
        if (!email || !password) {
          return res.status(400).json({ error: 'Email and password are required' });
        }
        const user = await createUser(email, password);
        if (role) {
          await updateUserRole(email, role as UserRole);
        }
        const { password: _, ...userData } = user;
        res.status(201).json(userData);
      } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
      break;

    case 'PATCH':
      try {
        const { email, role } = req.body;
        if (!email || !role) {
          return res.status(400).json({ error: 'Email and role are required' });
        }
        await updateUserRole(email, role as UserRole);
        res.status(200).json({ message: 'User role updated successfully' });
      } catch (error) {
        console.error('Error updating user role:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PATCH']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}