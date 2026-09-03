import { env, envOr } from '../common/env.js';

export type DatabaseConfig = {
  url: string;
};

export function databaseConfig(): DatabaseConfig {
  return {
    url: env('DATABASE_URL'),
  };
}

export type AuthRuntimeConfig = {
  jwtSecret: string;
  jwtRefreshSecret: string;
  frontendOrigin: string;
  port: number;
};

export function authRuntimeConfig(): AuthRuntimeConfig {
  return {
    jwtSecret: env('JWT_SECRET'),
    jwtRefreshSecret: env('JWT_REFRESH_SECRET'),
    frontendOrigin: envOr('FRONTEND_ORIGIN', 'http://localhost:5173'),
    port: Number.parseInt(envOr('PORT', '3000'), 10),
  };
}
