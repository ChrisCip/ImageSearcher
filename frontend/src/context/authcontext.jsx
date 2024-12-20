import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        // Intentar recuperar el usuario del localStorage al iniciar
        const savedUser = localStorage.getItem('user')
        return savedUser ? JSON.parse(savedUser) : null
    })

    // Guardar el usuario en localStorage cuando cambie
    useEffect(() => {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user))
        } else {
            localStorage.removeItem('user')
        }
    }, [user])

    const login = (userData) => {
        if (userData.success && userData.user && userData.token) {
            // Asegurarse de que el ID del usuario esté en mayúscula
            const user = {
                ...userData.user,
                Id: userData.user.id || userData.user.Id // Mantener la consistencia del ID
            }
            setUser(user)
            localStorage.setItem('token', userData.token)
            localStorage.setItem('user', JSON.stringify(user))
        }
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem('user')
        localStorage.removeItem('token')
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, setUser }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}