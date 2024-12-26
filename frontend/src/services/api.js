import axios from 'axios'

const api = axios.create({
    baseURL: 'http://localhost:3000/api'
})

// Interceptor para añadir el token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// Servicios de autenticación
export const authService = {
    login: async (correo, contraseña) => {
        try {
            const response = await api.post('/auth/login', {
                correo: correo,
                contraseña: contraseña
            })
            return response.data
        } catch (error) {
            console.error('Error en login:', error)
            throw error.response?.data || error
        }
    },
    register: async (userData) => {
        try {
            const response = await api.post('/auth/register', userData)
            return response.data
        } catch (error) {
            console.error('Error en registro:', error)
            throw error.response?.data || error
        }
    }
}

// Servicios de imágenes
export const imageService = {
    search: async (query, page = 1) => {
        const response = await api.get('/api/unsplash/search', {
            params: {
                q: query,
                page,
                per_page: 30
            }
        });
        return response.data;
    },
    getUnsplash: async (query, page = 1, per_page = 30) => {
        try {
            console.log('Realizando búsqueda:', { query, page, per_page });
            const response = await api.get('/api/unsplash/search', {
                params: {
                    q: query,
                    page,
                    per_page
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error en búsqueda:', error);
            throw error;
        }
    },
    save: async (imageData) => {
        try {
            const response = await api.post('/api/images/save', imageData)
            return response.data
        } catch (error) {
            console.error('Error al guardar imagen:', error)
            throw error.response?.data || error
        }
    },
    getSaved: async (UsuarioId) => {
        try {
            const response = await api.get(`/api/images/saved/${UsuarioId}`)
            return response.data
        } catch (error) {
            console.error('Error al obtener imágenes guardadas:', error)
            throw error.response?.data || error
        }
    },
    delete: async (imageId, UsuarioId) => {
        try {
            const response = await api.delete(`/api/images/${imageId}`, {
                params: { UsuarioId }
            })
            return response.data
        } catch (error) {
            console.error('Error al eliminar imagen:', error)
            throw error.response?.data || error
        }
    }
}

// Servicios de usuario
export const userService = {
    getProfile: async () => {
        const response = await api.get('/user/profile')
        return response.data
    },
    updateProfile: async (userData) => {
        const response = await api.put('/user/profile', userData)
        return response.data
    }
}

export default api