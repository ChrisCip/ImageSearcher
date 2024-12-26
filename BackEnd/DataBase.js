import sql from 'mssql';
import config from './config.js'; 

const dbConfig = {
  server: config.DB_SERVER,
  database: config.DB_NAME,
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  options: {
    trustServerCertificate: true,
    multiSubnetFailover: true,
    encrypt: false
  }
};


export const getConnection = async () => {
  try {
    const pool = await sql.connect(dbConfig);
    return pool;
  } catch (error) {
    console.error('Error de conexión:', error);
    throw error;
  }
}
