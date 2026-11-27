import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  port: Number(process.env.PORT ?? 3000),
}));

export const databaseConfig = registerAs('database', () => ({
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  name: process.env.POSTGRES_DB,
}));
