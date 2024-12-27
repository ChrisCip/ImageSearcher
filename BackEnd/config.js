import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Variables de entorno hardcodeadas
const ENV_VARS = {
  DB_USER: 'root',
  DB_PASSWORD: 'sQMZgOmAOLKCfPnutVXnzIBxukDLSBAb',
  DB_SERVER: 'autorack.proxy.rlwy.net',
  DB_NAME: 'imagesearcher',
  DB_PORT: 53421,
  UNSPLASH_ACCESS_KEY: 'jpQYFMw2Vau9zyUWlCkhTWjjJ1LUH1ioL4z5nNjdRVo',
  UNSPLASH_SECRET_KEY: 'TMft0a2ZOqB36S_DBuPOREb2ufuhD5ODvdAUMEgkZSY',
  NODE_ENV: 'development',
  PORT: 3000,
  JWT_SECRET: '96c692258f44cc7dde5301d3acbd85b8f68f9c7980e5afa67e670a2b586a962bd9cb139044ca9aea9888609dfd397f9b8aed91d3d09835c722a8f1b438b6afd5'
};

// Configuración de la base de datos
export const config = {
  user: ENV_VARS.DB_USER,
  password: ENV_VARS.DB_PASSWORD,
  server: ENV_VARS.DB_SERVER,
  database: ENV_VARS.DB_NAME,
  port: ENV_VARS.DB_PORT,
  options: {
    trustServerCertificate: true
  }
};

// Exportar todas las variables de entorno
export default {
  NODE_ENV: ENV_VARS.NODE_ENV,
  HOST: 'localhost',
  PORT: ENV_VARS.PORT,
  UNSPLASH_ACCESS_KEY: ENV_VARS.UNSPLASH_ACCESS_KEY,
  UNSPLASH_SECRET_KEY: ENV_VARS.UNSPLASH_SECRET_KEY,
  DB_USER: ENV_VARS.DB_USER,
  DB_PASSWORD: ENV_VARS.DB_PASSWORD,
  DB_NAME: ENV_VARS.DB_NAME,
  DB_SERVER: ENV_VARS.DB_SERVER,
  DB_PORT: ENV_VARS.DB_PORT
};

export { ENV_VARS };