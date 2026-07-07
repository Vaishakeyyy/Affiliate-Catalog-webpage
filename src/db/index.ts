import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema.ts';

const sslEnabled = process.env.SQL_SSL === 'true' || Boolean(process.env.DATABASE_URL);

export const createPool = () => {
  const connectionString = process.env.DATABASE_URL;

  if (connectionString) {
    return mysql.createPool({
      uri: connectionString,
      ssl: sslEnabled ? { rejectUnauthorized: false } : undefined,
    });
  }

  return mysql.createPool({
    host: process.env.SQL_HOST || '127.0.0.1',
    port: process.env.SQL_PORT ? Number(process.env.SQL_PORT) : 3306,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DB_NAME,
    ssl: sslEnabled ? { rejectUnauthorized: false } : undefined,
  });
};

export const pool = createPool();

export const db = drizzle(pool, { schema, mode: 'default' });
