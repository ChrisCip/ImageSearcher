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
        try {
            const response = await api.get(`/unsplash/search?query=${encodeURIComponent(query)}&page=${page}&per_page=30`)
            return response.data
        } catch (error) {
            console.error('Error en la búsqueda:', error)
            throw error.response?.data || error
        }
    },
    getUnsplash: async (query) => {
        const response = await api.get(`/unsplash/search?q=${encodeURIComponent(query)}`)
        return response.data
    },
    save: async (imageData) => {
        try {
            const response = await api.post('/images/save', imageData)
            return response.data
        } catch (error) {
            console.error('Error al guardar imagen:', error)
            throw error.response?.data || error
        }
    },
    getSaved: async (userId) => {
        try {
            console.log('Obteniendo imágenes guardadas para usuario:', userId)
            const response = await api.get(`/images/saved/${userId}`)
            console.log('Respuesta de imágenes guardadas:', response.data)
            return response.data
        } catch (error) {
            console.error('Error al obtener imágenes guardadas:', error)
            throw error.response?.data || error
        }
    },
    delete: async (imageId, userId) => {
        try {
            console.log('Enviando petición de eliminación:', { imageId, userId }) // Debug
            const response = await api.delete(`/images/${imageId}`, {
                params: { userId }
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