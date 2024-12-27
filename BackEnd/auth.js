import { getConnection } from './DataBase.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const Auth = {
    login: async (correo, contraseña) => {
        try {
            console.log('Intentando login con:', correo);
            const connection = await getConnection();
            
            const [rows] = await connection.execute(
                'SELECT * FROM Usuario WHERE Correo = ?',
                [correo]
            );

            if (!rows || rows.length === 0) {
                return {
                    success: false,
                    message: 'Usuario no encontrado'
                };
            }

            const user = rows[0];
            const validPassword = await bcrypt.compare(contraseña, user.Contraseña);
            
            if (!validPassword) {
                return {
                    success: false,
                    message: 'Credenciales inválidas'
                };
            }

            const token = jwt.sign(
                { 
                    userId: user.Id,
                    email: user.Correo
                },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            await connection.end();
            
            return {
                success: true,
                data: {
                    id: user.Id,
                    nombre: user.Nombre,
                    apellido: user.Apellido,
                    correo: user.Correo,
                    token: token
                },
                message: 'Login exitoso'
            };
        } catch (error) {
            console.error('Error en login:', error);
            return {
                success: false,
                message: error.message
            };
        }
    },

    registro: async (userData) => {
        let connection;
        try {
            connection = await getConnection();
            
            // Verificar si el correo existe
            const [existingUsers] = await connection.execute(
                'SELECT COUNT(*) as count FROM Usuario WHERE Correo = ?',
                [userData.correo]
            );

            if (existingUsers[0].count > 0) {
                return {
                    success: false,
                    message: 'El correo electrónico ya está registrado'
                };
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(userData.contraseña, salt);

            const [result] = await connection.execute(
                'INSERT INTO Usuario (Nombre, Apellido, Correo, Contraseña, FechaCreacion, UltimoAcceso) VALUES (?, ?, ?, ?, NOW(), NOW())',
                [userData.nombre, userData.apellido, userData.correo, hashedPassword]
            );

            return {
                success: true,
                message: 'Usuario registrado exitosamente'
            };
        } catch (error) {
            console.error('Error detallado en registro:', error);
            throw new Error('Error al registrar usuario: ' + error.message);
        } finally {
            if (connection) {
                try {
                    await connection.end();
                } catch (err) {
                    console.error('Error al cerrar la conexión:', err);
                }
            }
        }
    }
};