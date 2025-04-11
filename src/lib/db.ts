import { db } from '../config/database';

export type UserRole = 'EMBASA' | 'ATENDIMENTO' | 'ADMIN';

export interface User {
  id: number;
  email: string;
  password: string;
  role: UserRole | null;
  created_at: number;
}

export interface Availability {
  id: number;
  date: string;
  period: 'morning' | 'afternoon';
  slot: 'first' | 'second';
  available: boolean;
  created_at: number;
}

export interface Appointment {
  id: number;
  date: string;
  period: 'morning' | 'afternoon';
  slot: 'first' | 'second';
  ss: string;
  comments?: string;
  created_at: number;
}

// Initialize database tables
export async function initializeDatabase() {
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
  const adminExists = await db.execute({
    sql: 'SELECT id FROM users WHERE email = ?',
    args: [adminEmail]
  });

  if (adminExists.rows.length === 0) {
    await db.execute({
      sql: 'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
      args: [adminEmail, 'agendamento12', 'ADMIN']
    });
  }
}

// User operations
export async function getUser(email: string): Promise<User | null> {
  const result = await db.execute({
    sql: 'SELECT * FROM users WHERE email = ?',
    args: [email]
  });
  return result.rows[0] as User || null;
}

export async function createUser(email: string, password: string): Promise<User> {
  const result = await db.execute({
    sql: 'INSERT INTO users (email, password) VALUES (?, ?) RETURNING *',
    args: [email, password]
  });
  return result.rows[0] as User;
}

export async function updateUserRole(email: string, role: UserRole | null): Promise<void> {
  await db.execute({
    sql: 'UPDATE users SET role = ? WHERE email = ?',
    args: [role, email]
  });
}

// Availability operations
export async function setAvailability(date: string, period: string, slot: string, available: boolean): Promise<void> {
  await db.execute({
    sql: `INSERT INTO availability (date, period, slot, available)
          VALUES (?, ?, ?, ?)
          ON CONFLICT(date, period, slot) DO UPDATE SET available = ?`,
    args: [date, period, slot, available, available]
  });
}

export async function getAvailability(date: string): Promise<Availability[]> {
  const result = await db.execute({
    sql: 'SELECT * FROM availability WHERE date = ?',
    args: [date]
  });
  return result.rows as Availability[];
}

// Appointment operations
export async function createAppointment(
  date: string,
  period: string,
  slot: string,
  ss: string,
  comments?: string
): Promise<Appointment> {
  const result = await db.execute({
    sql: `INSERT INTO appointments (date, period, slot, ss, comments)
          VALUES (?, ?, ?, ?, ?) RETURNING *`,
    args: [date, period, slot, ss, comments]
  });
  return result.rows[0] as Appointment;
}

export async function getAppointments(date: string): Promise<Appointment[]> {
  const result = await db.execute({
    sql: 'SELECT * FROM appointments WHERE date = ?',
    args: [date]
  });
  return result.rows as Appointment[];
}

export async function deleteAppointment(id: number): Promise<void> {
  await db.execute({
    sql: 'DELETE FROM appointments WHERE id = ?',
    args: [id]
  });
}

// Get all users (for admin panel)
export async function getAllUsers(): Promise<User[]> {
  const result = await db.execute('SELECT * FROM users');
  return result.rows as User[];
}