import mysql from 'mysql2/promise';
import config from './config.js';

export const getConnection = async () => {
  try {
    const connection = await mysql.createConnection({
      host: config.DB_SERVER,
      port: config.DB_PORT,
      user: config.DB_USER,
      password: config.DB_PASSWORD,
      database: config.DB_NAME
    });

    return connection;
  } catch (error) {
    console.error('Error al conectar a MySQL:', error);
    throw error;
  }
};
