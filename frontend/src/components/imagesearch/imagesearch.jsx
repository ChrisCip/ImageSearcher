import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { imageService } from '../../services/api';
import { useAuth } from '../../context/authcontext.jsx';

import './imagesearch.css';

function ImageSearch() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [query, setQuery] = useState('');
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [savedImages, setSavedImages] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalResults, setTotalResults] = useState(0);
    const [message, setMessage] = useState({ text: '', type: '' });

    const handleSearch = async (page = 1) => {
        if (!query) return;
        setLoading(true);
        setError('');
        try {
            const data = await imageService.search(query, page);
            setImages(data.results || []);
            setTotalPages(data.total_pages || 0);
            setTotalResults(data.total || 0);
            setCurrentPage(data.current_page || page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            setError('Error al buscar imágenes: ' + (error.message || 'Error desconocido'));
        } finally {
            setLoading(false);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            handleSearch(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            handleSearch(currentPage - 1);
        }
    };

    const handleSaveImage = async (image) => {
        try {
            if (!user) {
                setMessage({ text: 'Debes iniciar sesión para guardar imágenes', type: 'error' });
                navigate('/login');
                return;
            }
            
            const imageData = {
                usuarioId: user.Id,
                imageId: image.id,
                url: image.urls.regular,
                nombre: image.description || image.alt_description || 'Sin título'
            };
            
            const response = await imageService.save(imageData);
            if (response.success) {
                setSavedImages([...savedImages, image.id]);
                setMessage({ text: 'Imagen guardada correctamente', type: 'success' });
            }
        } catch (error) {
            if (error.response?.status === 409) {
                setMessage({ 
                    text: error.response.data.message || 'Esta imagen ya ha sido guardada', 
                    type: 'error' 
                });
            } else {
                setMessage({ 
                    text: 'Error al guardar la imagen: ' + (error.response?.data?.message || error.message),
                    type: 'error'
                });
            }
        }
        
        // Limpiar el mensaje después de 3 segundos
        setTimeout(() => {
            setMessage({ text: '', type: '' });
        }, 3000);
    };

    const getPageRange = () => {
        const range = [];
        const maxButtons = 5;
        let start = Math.max(1, currentPage - Math.floor(maxButtons / 2));
        let end = Math.min(totalPages, start + maxButtons - 1);
        if (end === totalPages) {
            start = Math.max(1, end - maxButtons + 1);
        }
        for (let i = start; i <= end; i++) {
            range.push(i);
        }
        return range;
    };

    const goToPage = (page) => {
        if (page !== currentPage) {
            handleSearch(page);
        }
    };

    const renderPagination = () => (
        <div className="pagination">
            <button onClick={() => goToPage(1)} disabled={currentPage === 1 || loading}>{'<<'}</button>
            <button onClick={handlePrevPage} disabled={currentPage === 1 || loading}>{'<'}</button>
            {getPageRange().map(page => (
                <button key={page} onClick={() => goToPage(page)}>{page}</button>
            ))}
            <button onClick={handleNextPage} disabled={currentPage === totalPages || loading}>{'>'}</button>
            <button onClick={() => goToPage(totalPages)} disabled={currentPage === totalPages || loading}>{'>>'}</button>
        </div>
    );

    return (
        <div className="image-search-container">
            <div className="search-header">
                <h1>Buscador de Imágenes</h1>
                <div className="header-buttons">
                    <button onClick={() => navigate('/profile')}>Mi Perfil</button>
                    <button onClick={() => { logout(); navigate('/login'); }}>Cerrar Sesión</button>
                </div>
            </div>

            <div className="search-box">
                <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar imágenes..." onKeyPress={(e) => e.key === 'Enter' && handleSearch(1)} />
                <button onClick={() => handleSearch(1)} disabled={loading}>{loading ? 'Buscando...' : 'Buscar'}</button>
            </div>

            {error && <div className="error-message">{error}</div>}

            {totalResults > 0 && <div className="search-results-info">{totalResults} resultados encontrados</div>}

            <div className="image-grid">
                {images.map((image) => (
                    <div key={image.id} className="image-card">
                        <img src={image.urls.regular} alt={image.alt_description} className="image" />
                        <div className="image-overlay">
                            <p className="image-description">{image.description || image.alt_description || 'Sin descripción'}</p>
                            <button onClick={() => handleSaveImage(image)} disabled={savedImages.includes(image.id)}>{savedImages.includes(image.id) ? 'Guardada' : 'Guardar'}</button>
                        </div>
                    </div>
                ))}
            </div>

            {totalResults > 0 && renderPagination()}

            {message.text && (
                <div className={`message ${message.type === 'error' ? 'error-message' : 'success-message'}`}>
                    {message.text}
                </div>
            )}
        </div>
    );
}

export default ImageSearch;