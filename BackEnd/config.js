import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Mapeo de nombres de ambiente
const envMap = {
  'development': '.env', 
  'production': 'production.env',
  'qas': 'qas.env'
};

const envFile = envMap[process.env.NODE_ENV] || '.env';

dotenv.config({
  path: resolve(__dirname, `../${envFile}`)
});

// Añadir logs para debug
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_SERVER:', process.env.DB_SERVER);

console.log('UNSPLASH_ACCESS_KEY:', process.env.UNSPLASH_ACCESS_KEY);

export const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    trustServerCertificate: true
  }
}

export default {
  NODE_ENV: process.env.NODE_ENV || 'development',
  HOST: process.env.HOST || '127.0.0.1',
  PORT: parseInt(process.env.PORT || '3000'),
  UNSPLASH_ACCESS_KEY: process.env.UNSPLASH_ACCESS_KEY,
  UNSPLASH_SECRET_KEY: process.env.UNSPLASH_SECRET_KEY,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,
  DB_SERVER: process.env.DB_SERVER
};