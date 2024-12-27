import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../../services/api.js'
import { useAuth } from '../../context/authcontext'
import './login.css'
import Particles from "@tsparticles/react";

function Login() {
    const [credentials, setCredentials] = useState({
        correo: '',
        contraseña: ''
    })
    const [error, setError] = useState('')
    const navigate = useNavigate()
    const { login } = useAuth()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        
        try {
            const response = await authService.login(credentials)
            if (response.success) {
                console.log('Usuario logueado:', response)
                login(response)
                navigate('/search')
            } else {
                setError('Credenciales inválidas')
            }
        } catch (error) {
            console.error('Error:', error)
            setError('Error al iniciar sesión')
        }
    }

    const handleChange = (e) => {
        setCredentials({
            ...credentials,
            [e.target.name]: e.target.value
        })
    }

    return (
        <div className="login-container">
            <Particles
                id="tsparticles"
                options={{
                    background: {
                        color: {
                            value: "#0d47a1",
                        },
                    },
                    fpsLimit: 60,
                    interactivity: {
                        events: {
                            onClick: {
                                enable: true,
                                mode: "push",
                            },
                            onHover: {
                                enable: true,
                                mode: "repulse",
                            },
                            resize: true,
                        },
                        modes: {
                            push: {
                                quantity: 4,
                            },
                            repulse: {
                                distance: 200,
                                duration: 0.4,
                            },
                        },
                    },
                    particles: {
                        color: {
                            value: "#ffffff",
                        },
                        links: {
                            color: "#ffffff",
                            distance: 150,
                            enable: true,
                            opacity: 0.5,
                            width: 1,
                        },
                        collisions: {
                            enable: true,
                        },
                        move: {
                            direction: "none",
                            enable: true,
                            outMode: "bounce",
                            random: false,
                            speed: 2,
                            straight: false,
                        },
                        number: {
                            density: {
                                enable: true,
                                area: 800,
                            },
                            value: 80,
                        },
                        opacity: {
                            value: 0.5,
                        },
                        shape: {
                            type: "circle",
                        },
                        size: {
                            random: true,
                            value: 5,
                        },
                    },
                    detectRetina: true,
                }}
            />
            <div className="login-box">
                <h2>Iniciar Sesión</h2>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Correo:</label>
                        <input
                            type="email"
                            name="correo"
                            value={credentials.correo}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Contraseña:</label>
                        <input
                            type="password"
                            name="contraseña"
                            value={credentials.contraseña}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type="submit">Iniciar Sesión</button>
                </form>
                <p style={{ marginTop: '15px', textAlign: 'center' }}>
                    ¿No tienes cuenta? <a href="/register" onClick={(e) => {
                        e.preventDefault()
                        navigate('/register')
                    }} style={{ color: '#007bff', textDecoration: 'underline', cursor: 'pointer' }}>Regístrate</a>
                </p>
            </div>
        </div>
    )
}

export default Login