import { getConnection } from './DataBase.js';
import sql from 'mssql';

export const SaveImage = {
    guardarImagen: async (imageData) => {
        try {
            console.log('Datos recibidos:', imageData); // Debug

            const pool = await getConnection();
            const result = await pool.request()
                .input('UsuarioId', sql.Int, parseInt(imageData.usuarioId))
                .input('Image_ID', sql.NVarChar(50), imageData.imageId.toString())
                .input('url', sql.NVarChar(500), imageData.url)
                .input('Nombre', sql.NVarChar(255), imageData.nombre)
                .execute('sp_GuardarImagen');

            console.log('Resultado SP:', result); // Debug

            if (result.recordset && result.recordset[0]) {
                return {
                    success: result.recordset[0].Success === 1,
                    message: result.recordset[0].Message
                };
            }

            return {
                success: false,
                message: 'Error al guardar imagen'
            };
        } catch (error) {
            console.error('Error detallado:', error);
            return {
                success: false,
                message: error.message
            };
        }
    },

    obtenerImagenesGuardadas: async (usuarioId) => {
        try {
            const pool = await getConnection();
            const result = await pool.request()
                .input('UsuarioId', sql.Int, usuarioId)
                .execute('sp_ObtenerImagenes'); 

            return {
                success: true,
                data: result.recordset
            };
        } catch (error) {
            console.error('Error al obtener imágenes guardadas:', error);
            return {
                success: false,
                message: error.message
            };
        }
    },

    eliminarImagen: async (usuarioId, imageId) => {
        try {
            console.log(`Intentando eliminar imagen ${imageId} del usuario ${usuarioId}`);
            
            const pool = await getConnection();
            const result = await pool.request()
                .input('UsuarioId', sql.Int, parseInt(usuarioId))
                .input('ImagenId', sql.Int, parseInt(imageId))
                .execute('sp_EliminarImagen'); 

            console.log('Respuesta del SP:', result.recordset[0]); // Debug log

            if (!result.recordset || !result.recordset[0]) {
                throw new Error('No se recibió respuesta del servidor');
            }

            const response = result.recordset[0];

            return {
                success: response.Success === 1,
                message: response.Message
            };
        } catch (error) {
            console.error('Error al eliminar imagen:', error);
            return {
                success: false,
                message: error.message || 'Error al eliminar la imagen'
            };
        }
    }
};