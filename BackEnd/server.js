import { ENV_VARS } from './config.js';
import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import fetch from 'node-fetch';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getConnection } from './DataBase.js';

// Configuración inicial del servidor
const app = express();
app.use(cors({
    origin: ['https://image-searcher-ochre.vercel.app','http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Rutas de autenticación
app.post('/api/auth/login', async (req, res) => {
    try {
        const { correo, contraseña } = req.body;
        const connection = await getConnection();

        const [rows] = await connection.execute(
            'SELECT * FROM Usuario WHERE Correo = ?',
            [correo]
        );

        if (rows.length === 0) {
            await connection.end();
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        const user = rows[0];
        const validPassword = await bcrypt.compare(contraseña, user.Contraseña);

        if (!validPassword) {
            await connection.end();
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        const token = jwt.sign(
            { id: user.Id, email: user.Correo },
            ENV_VARS.JWT_SECRET,
            { expiresIn: '24h' }
        );

        await connection.execute(
            'UPDATE Usuario SET UltimoAcceso = NOW() WHERE Id = ?',
            [user.Id]
        );

        await connection.end();
        res.json({
            success: true,
            user: {
                id: user.Id,
                email: user.Correo,
                name: user.Nombre,
                lastName: user.Apellido
            },
            token
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            success: false,
            message: 'Error en el servidor'
        });
    }
});

app.post('/api/auth/register', async (req, res) => {
    let connection;
    try {
        const { nombre, apellido, correo, contraseña } = req.body;
        console.log('Datos recibidos:', { nombre, apellido, correo }); // Debug
        
        if (!nombre || !apellido || !correo || !contraseña) {
            return res.status(400).json({
                success: false,
                message: 'Todos los campos son requeridos'
            });
        }

        connection = await getConnection();
        
        // Verificar si el correo ya existe
        const [existingUsers] = await connection.execute(
            'SELECT COUNT(*) as count FROM Usuario WHERE Correo = ?',
            [correo]
        );

        if (existingUsers[0].count > 0) {
            return res.status(400).json({
                success: false,
                message: 'El correo electrónico ya está registrado'
            });
        }

        // Hash de la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(contraseña, salt);
        
        // Insertar nuevo usuario
        const [result] = await connection.execute(
            'INSERT INTO Usuario (Nombre, Apellido, Correo, Contraseña, FechaCreacion, UltimoAcceso) VALUES (?, ?, ?, ?, NOW(), NOW())',
            [nombre, apellido, correo, hashedPassword]
        );
        
        console.log('Usuario registrado:', result); // Debug
        
        res.json({
            success: true,
            message: 'Usuario registrado exitosamente'
        });
    } catch (error) {
        console.error('Error detallado en registro:', error);
        res.status(500).json({
            success: false,
            message: 'Error al registrar usuario. Por favor, intente nuevamente.',
            error: ENV_VARS.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        if (connection) {
            try {
                await connection.end();
            } catch (err) {
                console.error('Error al cerrar la conexión:', err);
            }
        }
    }
});

// Ruta para búsqueda en Unsplash
app.get('/api/unsplash/search', async (req, res) => {
    try {
        const { q: query, page = 1, per_page = 30 } = req.query;
        console.log('Búsqueda Unsplash:', { query, page, per_page }); // Debug

        if (!process.env.UNSPLASH_ACCESS_KEY) {
            throw new Error('UNSPLASH_ACCESS_KEY no está configurada');
        }

        const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${per_page}`;
        const response = await fetch(url, {
            headers: {
                'Authorization': `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Error de API Unsplash: ${errorData.errors?.[0] || response.statusText}`);
        }

        const data = await response.json();
        console.log(`Encontrados ${data.total} resultados para "${query}"`); // Debug

        res.json({
            results: data.results,
            total: data.total,
            total_pages: data.total_pages,
            current_page: parseInt(page)
        });
    } catch (error) {
        console.error('Error en búsqueda Unsplash:', error);
        res.status(500).json({ error: error.message });
    }
});

// Rutas para imágenes guardadas
app.get('/api/images/saved/:usuarioId', async (req, res) => {
    try {
        const { usuarioId } = req.params;
        const connection = await getConnection();
        
        const [rows] = await connection.execute(
            'CALL sp_ObtenerImagenes(?)',
            [usuarioId]
        );
        
        await connection.end();
        res.json(rows[0]);
    } catch (error) {
        console.error('Error al obtener imágenes:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/images/save', async (req, res) => {
    try {
        const { usuarioId, imageId, url, nombre } = req.body;
        const connection = await getConnection();
        
        // Verificar si la imagen ya existe
        const [existingImages] = await connection.execute(
            'SELECT COUNT(*) as count FROM Imagenes WHERE UsuarioId = ? AND Image_ID = ?',
            [usuarioId, imageId]
        );
        
        if (existingImages[0].count > 0) {
            await connection.end();
            return res.status(409).json({ 
                success: false,
                message: 'Esta imagen ya ha sido guardada en tu colección'
            });
        }
        
        const [result] = await connection.execute(
            'CALL sp_GuardarImagen(?, ?, ?, ?)',
            [usuarioId, imageId, url, nombre]
        );
        
        await connection.end();
        res.json({
            success: result[0][0].Success === 1,
            message: result[0][0].Message
        });
    } catch (error) {
        console.error('Error al guardar imagen:', error);
        res.status(500).json({ 
            success: false,
            message: error.message || 'Error al guardar la imagen'
        });
    }
});

app.delete('/api/images/:imagenId', async (req, res) => {
    try {
        const { imagenId } = req.params;
        const { UsuarioId } = req.query;
        
        console.log('Intentando eliminar:', { imagenId, UsuarioId }); // Debug
        
        const connection = await getConnection();
        const [result] = await connection.execute(
            'CALL sp_EliminarImagen(?, ?)',
            [parseInt(UsuarioId), parseInt(imagenId)]
        );
        
        await connection.end();
        
        if (!result[0] || !result[0][0]) {
            throw new Error('No se recibió respuesta del servidor');
        }
        
        res.json({
            success: result[0][0].Success === 1,
            message: result[0][0].Message
        });
    } catch (error) {
        console.error('Error al eliminar:', error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});