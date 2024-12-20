import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../../services/api'
import './Register.css'

function Register() {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        correo: '',
        contraseña: ''
    })
    const [error, setError] = useState('')

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        // Validaciones básicas
        if (!formData.nombre || !formData.apellido || !formData.correo || !formData.contraseña) {
            setError('Todos los campos son obligatorios')
            return
        }

        // Validar formato de correo
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.correo)) {
            setError('El formato del correo no es válido')
            return
        }

        try {
            const response = await authService.register(formData)
            if (response.success) {
                alert('Registro exitoso')
                navigate('/login')
            } else {
                setError(response.message || 'Error al registrar usuario')
            }
        } catch (error) {
            setError(error.message || 'Error al registrar usuario')
        }
    }

    return (
        <div className="register-container">
            <div className="register-box">
                <h2>Registro</h2>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Nombre:</label>
                        <input
                            type="text"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Apellido:</label>
                        <input
                            type="text"
                            name="apellido"
                            value={formData.apellido}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Correo:</label>
                        <input
                            type="email"
                            name="correo"
                            value={formData.correo}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Contraseña:</label>
                        <input
                            type="password"
                            name="contraseña"
                            value={formData.contraseña}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type="submit">Registrarse</button>
                </form>
                <p className="login-link">
                    ¿Ya tienes cuenta? <a href="/login" onClick={(e) => {
                        e.preventDefault()
                        navigate('/login')
                    }}>Inicia sesión</a>
                </p>
            </div>
        </div>
    )
}

export default Register