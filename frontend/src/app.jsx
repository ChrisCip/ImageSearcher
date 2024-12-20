import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/authcontext'
import Login from './components/login/login'
import Register from './components/register/register'
import ImageSearch from './components/imagesearch/imagesearch';
import Profile from './components/profile/profile'
import PrivateRoute from './components/privateroute'

function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/search" element={
                        <PrivateRoute>
                            <ImageSearch />
                        </PrivateRoute>
                    } />
                    <Route path="/profile" element={
                        <PrivateRoute>
                            <Profile />
                        </PrivateRoute>
                    } />
                    <Route path="/" element={<Login />} />
                </Routes>
            </AuthProvider>
        </Router>
    )
}

export default App
