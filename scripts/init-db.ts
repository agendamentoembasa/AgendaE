import { db } from '../src/config/database';

async function main() {
  try {
    console.log('Creating tables...');
    
    // Users table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT CHECK(role IN ('EMBASA', 'ATENDIMENTO', 'ADMIN')) DEFAULT NULL,
        created_at INTEGER DEFAULT (unixepoch())
      )
    `);

    // Availability table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS availability (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        period TEXT CHECK(period IN ('morning', 'afternoon')) NOT NULL,
        slot TEXT CHECK(slot IN ('first', 'second')) NOT NULL,
        available BOOLEAN DEFAULT false,
        created_at INTEGER DEFAULT (unixepoch()),
        UNIQUE(date, period, slot)
      )
    `);

    // Appointments table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        period TEXT CHECK(period IN ('morning', 'afternoon')) NOT NULL,
        slot TEXT CHECK(slot IN ('first', 'second')) NOT NULL,
        ss TEXT NOT NULL,
        comments TEXT,
        created_at INTEGER DEFAULT (unixepoch()),
        UNIQUE(date, period, slot)
      )
    `);

    // Create initial admin user
    const adminEmail = 'agendamentoembasa@gmail.com';
    await db.execute({
      sql: `INSERT OR IGNORE INTO users (email, password, role) VALUES (?, ?, ?)`,
      args: [adminEmail, 'agendamento12', 'ADMIN']
    });

    console.log('Database initialization completed successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

main();