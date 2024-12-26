import './config.js'
import express from 'express'
import cors from 'cors'
import sql from 'mssql'
import fetch from 'node-fetch'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

console.log('Variables de entorno cargadas:')
console.log('UNSPLASH_ACCESS_KEY:', process.env.UNSPLASH_ACCESS_KEY)
console.log('DB_SERVER:', process.env.DB_SERVER)

// Verificar variables de entorno críticas
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error('Error crítico: JWT_SECRET no está definido en las variables de entorno');
    process.exit(1);
}

const app = express()

// Move this before any routes that use it
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    return res.status(401).json({ message: 'No se proporcionó token de acceso' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Formato de token inválido' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

// Configurar CORS
app.use(cors({
    origin: 'http://localhost:5173', // URL de tu frontend
    credentials: true
}))

app.use(express.json())

// Configuración de la base de datos
const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
}

// Rutas de autenticación
app.post('/api/auth/login', async (req, res) => {
    try {
        const { correo, contraseña } = req.body;

        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('Correo', sql.NVarChar, correo)
            .query('SELECT * FROM Usuario WHERE Correo = @Correo');

        if (result.recordset.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        const user = result.recordset[0];

        // Compare the provided password with the hashed password
        const validPassword = await bcrypt.compare(contraseña, user.Contraseña);

        if (!validPassword) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        const token = jwt.sign(
            { id: user.Id, email: user.Correo },
            JWT_SECRET,
            { 
                expiresIn: '24h',
                algorithm: 'HS256' // Especificar el algoritmo explícitamente
            }
        );

        await pool.request()
            .input('Id', sql.Int, user.Id)
            .query('UPDATE Usuario SET UltimoAcceso = GETDATE() WHERE Id = @Id');

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
            message: 'Error en el servidor',
            error: error.message
        });
    }
});

app.post('/api/auth/register', async (req, res) => {
    try {
        const { nombre, apellido, correo, contraseña } = req.body;

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(contraseña, salt);

        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('Nombre', sql.NVarChar, nombre)
            .input('Apellido', sql.NVarChar, apellido)
            .input('Correo', sql.NVarChar, correo)
            .input('Contraseña', sql.NVarChar, hashedPassword) // Store hashed password
            .execute('sp_RegistrarUsuario');

        if (result.recordset[0].Success === 1) {
            res.json({
                success: true,
                message: result.recordset[0].Message
            });
        } else {
            res.status(400).json({
                success: false,
                message: result.recordset[0].Message
            });
        }
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({
            success: false,
            message: 'Error al registrar usuario'
        });
    }
});

// Ruta para buscar imágenes en Unsplash
app.get('/api/unsplash/search',verifyToken, async (req, res) => {
    try {
        const { query, page = 1, per_page = 30 } = req.query
        console.log('Haciendo búsqueda en Unsplash con key:', process.env.UNSPLASH_ACCESS_KEY)
        
        const response = await fetch(
            `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${per_page}`,
            {
                headers: {
                    'Authorization': `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
                }
            }
        )

        if (!response.ok) {
            throw new Error(`Error en la API de Unsplash: ${response.status}`)
        }

        const data = await response.json()
        console.log('Respuesta de Unsplash:', {
            totalResults: data.total,
            totalPages: Math.ceil(data.total / per_page),
            currentPage: page,
            resultsInPage: data.results.length
        }) // Debug

        res.json({
            results: data.results,
            total: data.total,
            total_pages: Math.ceil(data.total / per_page),
            current_page: page
        })
    } catch (error) {
        console.error('Error completo en búsqueda:', error)
        res.status(500).json({
            success: false,
            message: 'Error al buscar imágenes',
            error: error.message
        })
    }
})

// Ruta para obtener imágenes guardadas
app.get('/api/images/saved/:userId', verifyToken, async (req, res) => {
    try {
        const userId = req.params.userId
        console.log('Obteniendo imágenes guardadas para usuario:', userId)

        const pool = await sql.connect(config)
        const result = await pool.request()
            .input('UsuarioId', sql.Int, userId)
            .execute('sp_ObtenerImagenes')  // Nombre correcto del SP

        console.log('Imágenes encontradas:', result.recordset)

        if (!result.recordset) {
            return res.json([])
        }

        // Mapear los resultados para que coincidan con el formato esperado
        const images = result.recordset.map(img => ({
            id: img.Id,
            userId: img.UsuarioId,
            imageId: img.Image_ID,
            url: img.url,
            name: img.Nombre,
            savedAt: img.FechaGuardado
        }))

        res.json(images)
    } catch (error) {
        console.error('Error al obtener imágenes guardadas:', error)
        res.status(500).json({
            success: false,
            message: 'Error al obtener las imágenes guardadas',
            error: error.message
        })
    }
})

// Ruta para guardar imagen
app.post('/api/images/save', verifyToken, async (req, res) => {
    try {
        const { url, title, userId } = req.body

        if (!url || !userId) {
            return res.status(400).json({
                success: false,
                message: 'Se requieren todos los campos'
            })
        }
        
        // Verificar que el usuario del token coincida con el userId
        if (req.user.id !== parseInt(userId)) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para realizar esta acción'
            })
        }

        const pool = await sql.connect(config)

        // Verificar que el usuario exista antes de guardar
        const verificacionUsuario = await pool.request()
            .input('UsuarioId', sql.Int, userId)
            .query('SELECT COUNT(*) as count FROM Usuario WHERE Id = @UsuarioId')

        if (verificacionUsuario.recordset[0].count === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            })
        }

        // Si la verificación pasa, proceder con el guardado
        const result = await pool.request()
            .input('UsuarioId', sql.Int, userId)
            .input('Image_ID', sql.VarChar, url)
            .input('url', sql.VarChar, url)
            .input('Nombre', sql.VarChar, title || 'Sin título')
            .execute('sp_GuardarImagen')

        if (result.recordset[0].Success === 1) {
            res.json({
                success: true,
                message: result.recordset[0].Message
            })
        } else {
            // Si el SP devuelve éxito = 0, no realizar ninguna acción adicional
            res.status(400).json({
                success: false,
                message: result.recordset[0].Message
            })
        }
    } catch (error) {
        console.error('Error al guardar imagen:', error)
        res.status(500).json({
            success: false,
            message: 'Error al guardar la imagen'
        })
    }
})

// Ruta para eliminar imagen
app.delete('/api/images/:id', verifyToken, async (req, res) => {
    try {
        const imagenId = req.params.id
        const usuarioId = req.query.userId

        if (!imagenId || !usuarioId) {
            return res.status(400).json({
                success: false,
                message: 'Se requiere el ID de la imagen y el ID del usuario'
            })
        }

        // Verificar que el usuario del token coincida con el userId
        if (req.user.id !== parseInt(usuarioId)) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para realizar esta acción'
            })
        }

        const pool = await sql.connect(config)

        // Primero verificar que la imagen exista y pertenezca al usuario
        const verificacion = await pool.request()
            .input('ImagenId', sql.Int, imagenId)
            .input('UsuarioId', sql.Int, usuarioId)
            .query('SELECT COUNT(*) as count FROM Imagenes WHERE Id = @ImagenId AND UsuarioId = @UsuarioId')

        if (verificacion.recordset[0].count === 0) {
            return res.status(404).json({
                success: false,
                message: 'La imagen no existe o no pertenece a este usuario'
            })
        }

        // Si la verificación pasa, proceder con la eliminación
        const result = await pool.request()
            .input('UsuarioId', sql.Int, usuarioId)
            .input('ImagenId', sql.Int, imagenId)
            .execute('sp_EliminarImagen')

        if (result.recordset[0].Success === 1) {
            res.json({
                success: true,
                message: result.recordset[0].Message
            })
        } else {
            // Si el SP devuelve éxito = 0, no realizar ninguna acción adicional
            res.status(400).json({
                success: false,
                message: result.recordset[0].Message
            })
        }
    } catch (error) {
        console.error('Error al eliminar imagen:', error)
        res.status(500).json({
            success: false,
            message: 'Error al eliminar la imagen'
        })
    }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`)
})