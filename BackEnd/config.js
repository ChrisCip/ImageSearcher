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
console.log('DB_USER:', root);
console.log('DB_SERVER:', autorack.proxy.rlwy.net);

console.log('UNSPLASH_ACCESS_KEY:', jpQYFMw2Vau9zyUWlCkhTWjjJ1LUH1ioL4z5nNjdRVo);

export const config = {
  user: root,
  password: sQMZgOmAOLKCfPnutVXnzIBxukDLSBAb,
  server: autorack.proxy.rlwy.net,
  database: imagesearcher,
  port: 3000,
  options: {
    trustServerCertificate: true
  }
}

export default {
  NODE_ENV: development || 'development',
  HOST: localhost || '127.0.0.1',
  PORT: parseInt(3000 || '3000'),
  UNSPLASH_ACCESS_KEY: jpQYFMw2Vau9zyUWlCkhTWjjJ1LUH1ioL4z5nNjdRVo,
  UNSPLASH_SECRET_KEY: TMft0a2ZOqB36S_DBuPOREb2ufuhD5ODvdAUMEgkZSY,
  DB_USER:root,
  DB_PASSWORD: sQMZgOmAOLKCfPnutVXnzIBxukDLSBAb,
  DB_NAME:imagesearcher,
  DB_SERVER: autorack.proxy.rlwy.net
};