import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;
const sqlHost = process.env.SQL_HOST;
const sqlDbName = process.env.SQL_DB_NAME;
const user = process.env.SQL_ADMIN_USER;
const password = process.env.SQL_ADMIN_PASSWORD;
const sqlPort = process.env.SQL_PORT ? Number(process.env.SQL_PORT) : 3306;
const sslEnabled = process.env.SQL_SSL === 'true' || Boolean(databaseUrl);

if (!databaseUrl) {
  if (!sqlHost) {
    throw new Error("SQL_HOST must be set in environment variables.");
  }
  if (!sqlDbName) {
    throw new Error("SQL_DB_NAME must be set in environment variables.");
  }
  if (!user) {
    throw new Error("SQL_ADMIN_USER must be set in environment variables.");
  }
  if (!password) {
    throw new Error("SQL_ADMIN_PASSWORD must be set in environment variables.");
  }
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: {
    ...(databaseUrl
      ? {
          url: databaseUrl,
        }
      : {
          host: sqlHost,
          port: sqlPort,
          user: user,
          password: password,
          database: sqlDbName,
        }),
    ssl: sslEnabled ? { rejectUnauthorized: false } : undefined,
  },
  verbose: true,
});
