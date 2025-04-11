export type UserRole = 'EMBASA' | 'ATENDIMENTO' | 'ADMIN';

export interface User {
  email: string;
  password: string;
  role: UserRole;
}

export const users: User[] = [
  {
    email: 'agendamentoembasa@gmail.com',
    password: 'agendamento12',
    role: 'ADMIN'
  }
];

// Local storage key for persisting users
export const USERS_STORAGE_KEY = 'agendamento_users';
export const AUTH_TOKEN_KEY = 'auth_token';

// Initialize users from localStorage or default to initial users array
export const initializeUsers = () => {
  if (typeof window !== 'undefined') {
    const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    if (!storedUsers) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    }
  }
};

// Get all users
export const getAllUsers = (): User[] => {
  if (typeof window === 'undefined') return users;
  const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
  return storedUsers ? JSON.parse(storedUsers) : users;
};

// Add a new user
export const addUser = (user: User): void => {
  const currentUsers = getAllUsers();
  if (currentUsers.some(u => u.email === user.email)) {
    throw new Error('User already exists');
  }
  currentUsers.push(user);
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(currentUsers));
};

// Update user role
export const updateUserRole = (email: string, role: UserRole): void => {
  const currentUsers = getAllUsers();
  const userIndex = currentUsers.findIndex(u => u.email === email);
  if (userIndex === -1) throw new Error('User not found');
  
  currentUsers[userIndex].role = role;
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(currentUsers));
};