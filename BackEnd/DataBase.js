import mysql from 'mysql2/promise';
import { config } from './config.js';

export const getConnection = async () => {
    return await mysql.createConnection({
        host: config.server,
        user: config.user,
        password: config.password,
        database: config.database,
        connectTimeout: 30000, // 30 segundos
        timeout: 60000 // 60 segundos para queries
    });
};
