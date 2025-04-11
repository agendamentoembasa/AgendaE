export const env = {
  tursoAuthToken: process.env.TURSO_AUTH_TOKEN,
  tursoDbUrl: process.env.TURSO_DB_URL || 'https://david-agendamentoembasa.aws-us-east-1.turso.io',
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: process.env.NODE_ENV !== 'production'
};