import sql from 'mssql';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getConnection } from '../DataBase.js';
import { auth } from '../auth.js';

import { Auth } from '../auth.js';

export const userController = {
    registerUser: async (req, res) => {
        try {
            const result = await Auth.registro(req.body);
            if (result.success) {
                res.json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            console.error('Error en registro de usuario:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Error interno del servidor al registrar usuario',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    },

    loginUser: async (req, res) => {
        try {
            const { correo, contraseña } = req.body;
            const result = await Auth.login(correo, contraseña);
            if (result.success) {
                res.json(result);
            } else {
                res.status(401).json(result);
            }
        } catch (error) {
            res.status(500).json({ 
                success: false, 
                message: error.message });
        }
    }
};