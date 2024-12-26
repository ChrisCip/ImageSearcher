import { getConnection } from '../DataBase.js';

export const imageController = {
    saveImage: async (req, res) => {
        try {
            const { usuarioId, imageId, url, nombre } = req.body;
            
            // Verificar si la imagen ya existe
            const connection = await getConnection();
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
    },

    getImages: async (req, res) => {
        try {
            const { usuarioId } = req.params;
            const connection = await getConnection();
            
            const [rows] = await connection.execute(
                'CALL sp_ObtenerImagenes(?)',
                [usuarioId]
            );
            
            const images = rows[0].map(img => ({
                Id: img.Id,
                UsuarioId: img.UsuarioId,
                Image_ID: img.Image_ID,
                url: img.URL,
                name: img.Nombre,
                fechaGuardado: img.FechaGuardado
            }));
            
            await connection.end();
            res.json(images);
        } catch (error) {
            console.error('Error completo:', error);
            res.status(500).json({ error: error.message });
        }
    },

    deleteImage: async (req, res) => {
        try {
            const { imagenId } = req.params;
            const { UsuarioId } = req.query;
            
            console.log('Parámetros recibidos:', { imagenId, UsuarioId }); // Debug
            
            if (!imagenId || !UsuarioId) {
                return res.status(400).json({ 
                    error: 'Se requieren tanto el ID de la imagen como el ID del usuario' 
                });
            }

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
            console.error('Error detallado:', error);
            res.status(500).json({ 
                error: error.message || 'Error al eliminar la imagen',
                details: error
            });
        }
    }
};