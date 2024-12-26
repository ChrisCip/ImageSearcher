import mysql from 'mysql2/promise';
import { config } from './config.js';

export const getConnection = async () => {
    try {
        return await mysql.createConnection({
            host: config.server,
            user: config.user,
            password: config.password,
            database: config.database,
            port: config.port,
            connectTimeout: 30000,
            timeout: 60000,
            ssl: process.env.NODE_ENV === 'production' ? {
                rejectUnauthorized: false
            } : undefined
        });
    } catch (error) {
        console.error('Error al conectar con la base de datos:', error);
        throw new Error('Error de conexión con la base de datos: ' + error.message);
    }
};
