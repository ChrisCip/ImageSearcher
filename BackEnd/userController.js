import sql from 'mssql';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getConnection } from '../DataBase.js';

export const userController = {
    // Registrar usuario
    registerUser: async (req, res) => {
        try {
            const { nombre, apellido, correo, contraseña } = req.body;
            
            // Generar el hash de la contraseña
            const hashedPassword = await bcrypt.hash(contraseña, 10);
            
            // Log para verificar el hash
            console.log('Contraseña original:', contraseña);
            console.log('Hash generado:', hashedPassword);
            
            // Obtener la conexión
            const pool = await getConnection();
            
            // Insertar usuario con la contraseña hasheada
            const result = await pool.request()
                .input('Nombre', sql.NVarChar, nombre)
                .input('Apellido', sql.NVarChar, apellido)
                .input('Correo', sql.NVarChar, correo)
                .input('Contraseña', sql.NVarChar, hashedPassword)
                .execute('sp_RegistrarUsuario');

            // Verificar el resultado
            const verify = await pool.request()
                .input('Correo', sql.NVarChar, correo)
                .query('SELECT Contraseña FROM Usuario WHERE Correo = @Correo');
            
            console.log('Contraseña guardada en BD:', verify.recordset[0]?.Contraseña);

            res.json(result.recordset[0]);
        } catch (error) {
            console.error('Error en registro:', error);
            res.status(500).json({ error: error.message });
        }
    },

    // Login usuario
    loginUser: async (req, res) => {
        try {
            const { correo, contraseña } = req.body;
            const pool = await getConnection();
            
            const userResult = await pool.request()
                .input('Correo', sql.NVarChar, correo)
                .query('SELECT * FROM Usuario WHERE Correo = @Correo');

            if (userResult.recordset && userResult.recordset.length > 0) {
                const user = userResult.recordset[0];
                
                // Comparar la contraseña con el hash
                const validPassword = await bcrypt.compare(contraseña, user.Contraseña);
                
                if (validPassword) {
                    // Crear token JWT
                    const token = jwt.sign(
                        { id: user.Id, correo: user.Correo },
                        'tu_secreto_jwt', // Deberías mover esto a variables de entorno
                        { expiresIn: '24h' }
                    );

                    // Actualizar último acceso
                    await pool.request()
                        .input('Id', sql.Int, user.Id)
                        .query('UPDATE Usuario SET UltimoAcceso = GETDATE() WHERE Id = @Id');

                    res.json({
                        success: true,
                        user: {
                            id: user.Id,
                            nombre: user.Nombre,
                            apellido: user.Apellido,
                            correo: user.Correo,
                            estado: user.Estado,
                            ultimoAcceso: user.UltimoAcceso
                        },
                        token
                    });
                } else {
                    res.status(401).json({ success: false, message: "Credenciales inválidas" });
                }
            } else {
                res.status(401).json({ success: false, message: "Credenciales inválidas" });
            }
        } catch (error) {
            console.error('Error en login:', error);
            res.status(500).json({ error: error.message });
        }
    }
};