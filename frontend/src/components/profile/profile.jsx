import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/authcontext'
import { imageService } from '../../services/api'
import './Profile.css'

function Profile() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [savedImages, setSavedImages] = useState([])

    useEffect(() => {
        if (user?.Id) {
            loadSavedImages()
        }
    }, [user])

    const loadSavedImages = async () => {
        try {
            const images = await imageService.getSaved(user.Id)
            setSavedImages(images)
        } catch (error) {
            console.error('Error al cargar imágenes:', error)
        }
    }

    return (
        <div className="profile">
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
                        <div key={image.id} className="profile__image-card">
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
                                            await imageService.delete(image.id, user.Id)
                                            loadSavedImages()
                                        } catch (error) {
                                            console.error('Error al eliminar:', error)
                                            alert('Error al eliminar la imagen: ' + 
                                                (error.response?.data?.message || error.message))
                                        }
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