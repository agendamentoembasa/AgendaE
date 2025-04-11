import { createClient } from "@libsql/client";

export const db = createClient({
  url: "file:local.db",
  syncUrl: "https://david-agendamentoembasa.aws-us-east-1.turso.io",
  authToken: process.env.TURSO_AUTH_TOKEN
});