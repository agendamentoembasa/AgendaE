import { createClient } from "@libsql/client";
import { env } from './env';

if (!env.tursoAuthToken) {
  throw new Error('TURSO_AUTH_TOKEN is required');
}

export const db = createClient({
  url: "file:local.db",
  syncUrl: env.tursoDbUrl,
  authToken: env.tursoAuthToken
});