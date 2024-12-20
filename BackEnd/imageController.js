import sql from 'mssql';
import { getConnection } from '../DataBase.js';

export const imageController = {
    // Guardar imagen
    saveImage: async (req, res) => {
        try {
            const { usuarioId, imageId, url, nombre } = req.body;
            const pool = await getConnection();
            
            const result = await pool.request()
                .input('UsuarioId', sql.Int, usuarioId)
                .input('Image_ID', sql.Int, imageId)
                .input('url', sql.NVarChar, url)
                .input('Nombre', sql.NVarChar, nombre)
                .execute('sp_GuardarImagen');
            
            res.json({ message: "Imagen guardada exitosamente" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Obtener imágenes de un usuario
    getImages: async (req, res) => {
        try {
            const { usuarioId } = req.params;
            const pool = await getConnection();
            
            const result = await pool.request()
                .input('UsuarioId', sql.Int, usuarioId)
                .execute('sp_ObtenerImagenes');
            
            const images = result.recordset.map(img => ({
                id: img.Id,
                usuarioId: img.UsuarioId,
                imageId: img.Image_ID,
                url: img.url,
                nombre: img.Nombre,
                fechaGuardado: img.FechaGuardado
            }));
            
            res.json(images);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Eliminar imagen
    deleteImage: async (req, res) => {
        try {
            const { imagenId } = req.params;
            const pool = await getConnection();
            
            const result = await pool.request()
                .input('ImagenId', sql.Int, imagenId)
                .execute('sp_EliminarImagen');
            
            res.json({ message: "Imagen eliminada exitosamente" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};