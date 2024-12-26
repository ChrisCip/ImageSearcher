import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/authcontext'
import { imageService } from '../../services/api'
import './profile.css'

function Profile() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [savedImages, setSavedImages] = useState([])
    const [message, setMessage] = useState({ text: '', type: '' })

    useEffect(() => {
        if (user) {
            loadSavedImages()
        }
    }, [user])

    const loadSavedImages = async () => {
        try {
            const images = await imageService.getSaved(user.Id)
            setSavedImages(images)
        } catch (error) {
            setMessage({
                text: 'Error al cargar imágenes: ' + error.message,
                type: 'error'
            })
        }
    }

    return (
        <div className="profile">
            {message.text && (
                <div className={`message ${message.type === 'error' ? 'error-message' : 'success-message'}`}>
                    {message.text}
                </div>
            )}
            <header className="profile__header">
                <h1 className="profile__title">Perfil de Usuario</h1>
            </header>
            
            <section className="profile__info">
                <p className="profile__info-item">
                    <span className="profile__label">Nombre:</span> 
                    {user?.name} {user?.lastName}
                </p>
                <p className="profile__info-item">
                    <span className="profile__label">Email:</span> 
                    {user?.email}
                </p>
            </section>

            <section className="profile__saved-images">
                <h2 className="profile__subtitle">Imágenes Guardadas</h2>
                <div className="profile__image-grid">
                    {savedImages.map((image) => (
                        <div key={image.Id} className="profile__image-card">
                            <img
                                src={image.url}
                                alt={image.name}
                                className="profile__image"
                            />
                            <div className="profile__image-details">
                                <p className="profile__image-name">{image.name}</p>
                                <button
                                    onClick={async () => {
                                        try {
                                            if (!image.Id) {
                                                throw new Error('ID de imagen no válido')
                                            }
                                            await imageService.delete(image.Id, user.Id)
                                            setMessage({
                                                text: 'Imagen eliminada correctamente',
                                                type: 'success'
                                            })
                                            loadSavedImages()
                                        } catch (error) {
                                            setMessage({
                                                text: 'Error al eliminar la imagen: ' + 
                                                    (error.response?.data?.message || error.message),
                                                type: 'error'
                                            })
                                        }
                                        setTimeout(() => {
                                            setMessage({ text: '', type: '' })
                                        }, 3000)
                                    }}
                                    className="profile__btn profile__btn--delete"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <div className="profile__actions">
                <button
                    onClick={() => navigate('/search')}
                    className="profile__btn profile__btn--search"
                >
                    Buscar Imágenes
                </button>
                <button
                    onClick={() => {
                        logout()
                        navigate('/login')
                    }}
                    className="profile__btn profile__btn--logout"
                >
                    Cerrar Sesión
                </button>
            </div>
        </div>
    )
}

export default Profile