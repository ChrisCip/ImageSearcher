import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getConnection } from './DataBase.js';
import sql from 'mssql';

const JWT_SECRET = 'tu_clave_secreta_muy_segura';
const JWT_EXPIRES_IN = '60m';

// Middleware de verificación de token
export const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: 'No se proporcionó token de acceso'
            });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Formato de token inválido'
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Token inválido o expirado'
        });
    }
};

export const Auth = {
    login: async (correo, contraseña) => {
        try {
            console.log('Intentando login con:', correo); // Debug log
            const pool = await getConnection();
            const result = await pool.request()
                .input('Correo', sql.NVarChar, correo)
                .input('Contraseña', sql.NVarChar, contraseña)
                .execute('sp_LoginUsuario');

            console.log('Resultado SP:', result.recordset[0]); // Debug log

            if (!result.recordset || !result.recordset[0]) {
                return {
                    success: false,
                    message: 'Usuario no encontrado'
                };
            }

            const user = result.recordset[0];

            // Si el SP devuelve Success = 0, significa que el usuario no existe
            if (user.Success === 0) {
                return {
                    success: false,
                    message: user.Message || 'Credenciales inválidas'
                };
            }

            // Verificar contraseña
            const validPassword = await bcrypt.compare(contraseña, user.Contraseña);
            if (!validPassword) {
                console.log('Contraseña inválida para usuario:', correo); // Debug log
                return {
                    success: false,
                    message: 'Credenciales inválidas'
                };
            }

            // Generar token JWT
            const token = jwt.sign(
                { 
                    userId: user.Id,
                    email: user.Correo
                },
                JWT_SECRET,
                { expiresIn: JWT_EXPIRES_IN }
            );

            return {
                success: true,
                data: {
                    id: user.Id,
                    nombre: user.Nombre,
                    apellido: user.Apellido,
                    correo: user.Correo,
                    ultimoAcceso: user.UltimoAcceso,
                    token: token
                },
                message: 'Login exitoso'
            };
        } catch (error) {
            console.error('Error detallado en login:', error); // Debug log
            return {
                success: false,
                message: error.message
            };
        }
    },

    registro: async (userData) => {
        try {
            console.log('Iniciando registro de usuario:', userData.correo);

            // Primero verificar si el correo ya existe
            const pool = await getConnection();
            const checkEmail = await pool.request()
                .input('Correo', sql.NVarChar, userData.correo)
                .query('SELECT COUNT(*) as count FROM Usuario WHERE Correo = @Correo');

            if (checkEmail.recordset[0].count > 0) {
                return {
                    success: false,
                    message: 'El correo electrónico ya está registrado'
                };
            }

            // Si el correo no existe, proceder con el registro
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(userData.contraseña, salt);
            console.log('Contraseña hasheada generada');

            const result = await pool.request()
                .input('Nombre', sql.NVarChar, userData.nombre)
                .input('Apellido', sql.NVarChar, userData.apellido)
                .input('Correo', sql.NVarChar, userData.correo)
                .input('Contraseña', sql.NVarChar, hashedPassword)
                .execute('sp_RegistrarUsuario');

            console.log('Respuesta del SP:', result.recordset[0]);

            if (!result.recordset || !result.recordset[0]) {
                throw new Error('No se recibió respuesta del servidor');
            }

            const response = result.recordset[0];
            
            // Manejar la respuesta del SP
            if (response.Success === 0) {
                return {
                    success: false,
                    message: response.Message || 'Error al registrar usuario'
                };
            }

            return {
                success: true,
                message: 'Usuario registrado exitosamente'
            };
        } catch (error) {
            console.error('Error en registro:', error);
            return { 
                success: false, 
                message: error.message || 'Error al registrar usuario'
            };
        }
    }
};