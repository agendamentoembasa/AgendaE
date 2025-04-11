import { db } from '../config/database';

export type UserRole = 'EMBASA' | 'ATENDIMENTO' | 'ADMIN';

export interface User {
  id: number;
  email: string;
  password?: string;
  role: UserRole | null;
  created_at?: number;
}

export interface Availability {
  id: number;
  date: string;
  period: 'morning' | 'afternoon';
  slot: 'first' | 'second';
  available: boolean;
  created_at?: number;
}

export interface Appointment {
  id: number;
  date: string;
  period: 'morning' | 'afternoon';
  slot: 'first' | 'second';
  ss: string;
  comments?: string;
  created_at?: number;
}

// Initialize database tables
export async function initializeDatabase() {
  try {
    await db.batch([
      // Users table
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT CHECK(role IN ('EMBASA', 'ATENDIMENTO', 'ADMIN')) DEFAULT NULL,
        created_at INTEGER DEFAULT (unixepoch())
      )`,
      
      // Availability table
      `CREATE TABLE IF NOT EXISTS availability (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        period TEXT CHECK(period IN ('morning', 'afternoon')) NOT NULL,
        slot TEXT CHECK(slot IN ('first', 'second')) NOT NULL,
        available BOOLEAN DEFAULT false,
        created_at INTEGER DEFAULT (unixepoch()),
        UNIQUE(date, period, slot)
      )`,
      
      // Appointments table
      `CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        period TEXT CHECK(period IN ('morning', 'afternoon')) NOT NULL,
        slot TEXT CHECK(slot IN ('first', 'second')) NOT NULL,
        ss TEXT NOT NULL,
        comments TEXT,
        created_at INTEGER DEFAULT (unixepoch()),
        UNIQUE(date, period, slot)
      )`
    ]);

    // Create initial admin user if it doesn't exist
    const adminEmail = 'agendamentoembasa@gmail.com';
    const result = await db.execute({
      sql: 'SELECT id FROM users WHERE email = ?',
      args: [adminEmail]
    });

    if (result.rows.length === 0) {
      await db.execute({
        sql: 'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
        args: [adminEmail, 'agendamento12', 'ADMIN']
      });
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// User operations
export async function getUser(email: string): Promise<User | null> {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM users WHERE email = ?',
      args: [email]
    });
    return result.rows[0] as User || null;
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
}

export async function createUser(email: string, password: string): Promise<User> {
  try {
    const result = await db.execute({
      sql: 'INSERT INTO users (email, password) VALUES (?, ?) RETURNING *',
      args: [email, password]
    });
    return result.rows[0] as User;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export async function updateUserRole(email: string, role: UserRole): Promise<void> {
  try {
    await db.execute({
      sql: 'UPDATE users SET role = ? WHERE email = ?',
      args: [role, email]
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
}

// Availability operations
export async function setAvailability(
  date: string,
  period: 'morning' | 'afternoon',
  slot: 'first' | 'second',
  available: boolean
): Promise<void> {
  try {
    await db.execute({
      sql: `INSERT INTO availability (date, period, slot, available)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(date, period, slot) DO UPDATE SET available = ?`,
      args: [date, period, slot, available, available]
    });
  } catch (error) {
    console.error('Error setting availability:', error);
    throw error;
  }
}

export async function getAvailability(date: string): Promise<Availability[]> {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM availability WHERE date = ?',
      args: [date]
    });
    return result.rows as Availability[];
  } catch (error) {
    console.error('Error getting availability:', error);
    throw error;
  }
}

// Appointment operations
export async function createAppointment(
  date: string,
  period: 'morning' | 'afternoon',
  slot: 'first' | 'second',
  ss: string,
  comments?: string
): Promise<Appointment> {
  try {
    const result = await db.execute({
      sql: `INSERT INTO appointments (date, period, slot, ss, comments)
            VALUES (?, ?, ?, ?, ?) RETURNING *`,
      args: [date, period, slot, ss, comments]
    });
    return result.rows[0] as Appointment;
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
}

export async function getAppointments(date: string): Promise<Appointment[]> {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM appointments WHERE date = ?',
      args: [date]
    });
    return result.rows as Appointment[];
  } catch (error) {
    console.error('Error getting appointments:', error);
    throw error;
  }
}

export async function deleteAppointment(id: number): Promise<void> {
  try {
    await db.execute({
      sql: 'DELETE FROM appointments WHERE id = ?',
      args: [id]
    });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    throw error;
  }
}

// Get all users (for admin panel)
export async function getAllUsers(): Promise<User[]> {
  try {
    const result = await db.execute('SELECT * FROM users');
    return result.rows as User[];
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
}