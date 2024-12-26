import { getConnection } from './DataBase.js';

export const SaveImage = {
    guardarImagen: async (imageData) => {
        try {
            console.log('Datos recibidos:', imageData);
            const connection = await getConnection();
            
            const [result] = await connection.execute(
                'CALL sp_GuardarImagen(?, ?, ?, ?)',
                [
                    parseInt(imageData.usuarioId),
                    imageData.imageId.toString(),
                    imageData.url,
                    imageData.nombre
                ]
            );

            await connection.end();

            if (result[0] && result[0][0]) {
                return {
                    success: result[0][0].Success === 1,
                    message: result[0][0].Message
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
            const connection = await getConnection();
            const [rows] = await connection.execute(
                'CALL sp_ObtenerImagenes(?)',
                [usuarioId]
            );

            await connection.end();
            return {
                success: true,
                data: rows[0]
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
            
            const connection = await getConnection();
            const [result] = await connection.execute(
                'CALL sp_EliminarImagen(?, ?)',
                [parseInt(usuarioId), parseInt(imageId)]
            );

            await connection.end();

            if (!result[0] || !result[0][0]) {
                throw new Error('No se recibió respuesta del servidor');
            }

            return {
                success: result[0][0].Success === 1,
                message: result[0][0].Message
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