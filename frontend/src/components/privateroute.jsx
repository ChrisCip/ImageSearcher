import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/authcontext'

function PrivateRoute({ children }) {
    const { user } = useAuth()

    // Si no hay usuario autenticado, redirige al login
    if (!user) {
        return <Navigate to="/login" replace />
    }

    // Si hay usuario autenticado, renderiza el componente hijo
    return children
}

export default PrivateRoute