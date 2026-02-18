import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

// Initialize SQLite database only in non-test environments
let sqlite: Database.Database | null = null;
let db: ReturnType<typeof drizzle> | null = null;

if (process.env.NODE_ENV !== 'test') {
  sqlite = new Database('todo.db');
  db = drizzle(sqlite, { schema });
  sqlite.pragma('foreign_keys = ON');
}

// Export database instance for migrations
export { sqlite };

// Create a getter for db that throws in test environment
export const getDb = () => {
  if (process.env.NODE_ENV === 'test') {
    throw new Error('Database not available in test environment');
  }
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
};

// For backward compatibility, export db but it will throw in tests
// Using non-null assertion since db is initialized when not in test env
export { db as db };
