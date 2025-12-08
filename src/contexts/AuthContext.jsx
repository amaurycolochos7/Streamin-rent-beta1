import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUsers, saveUsers, getSession, saveSession, initializeDefaultAdmin } from '../utils/storage';
import { hashPassword, validatePassword, generateUserId } from '../utils/auth';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // Initialize default admin and restore session on mount
    useEffect(() => {
        initializeDefaultAdmin();
        const session = getSession();

        if (session) {
            // Verify user still exists
            const users = getUsers();
            const user = users.find(u => u.id === session.userId);

            if (user) {
                setCurrentUser({
                    id: user.id,
                    username: user.username,
                    role: user.role,
                    currency: user.currency || '$'
                });
                setIsAuthenticated(true);
            } else {
                // Clear invalid session
                saveSession(null);
            }
        }

        setLoading(false);
    }, []);

    // Login function
    const login = (username, password) => {
        const users = getUsers();
        const user = users.find(u => u.username === username);

        if (!user) {
            return { success: false, error: 'Usuario no encontrado' };
        }

        // Simple password check (in production, use validatePassword with hashing)
        if (user.password !== password) {
            return { success: false, error: 'Contraseña incorrecta' };
        }

        const session = {
            userId: user.id,
            username: user.username,
            role: user.role,
            loginTime: new Date().toISOString()
        };

        saveSession(session);
        setCurrentUser({
            id: user.id,
            username: user.username,
            role: user.role,
            currency: user.currency || '$'
        });
        setIsAuthenticated(true);

        return { success: true };
    };

    // Logout function
    const logout = () => {
        saveSession(null);
        setCurrentUser(null);
        setIsAuthenticated(false);
    };

    // Create new user (admin only)
    const createUser = (userData) => {
        if (!currentUser || currentUser.role !== 'admin') {
            return { success: false, error: 'No tienes permisos para crear usuarios' };
        }

        const users = getUsers();

        // Check if username already exists
        if (users.some(u => u.username === userData.username)) {
            return { success: false, error: 'El nombre de usuario ya existe' };
        }

        const newUser = {
            id: generateUserId(),
            username: userData.username,
            password: userData.password, // In production, hash this
            role: userData.role,
            currency: userData.currency || '$',
            createdAt: new Date().toISOString(),
            createdBy: currentUser.username
        };

        users.push(newUser);
        saveUsers(users);

        return { success: true, user: newUser };
    };

    // Update user (admin only)
    const updateUser = (userId, updates) => {
        if (!currentUser || currentUser.role !== 'admin') {
            return { success: false, error: 'No tienes permisos para actualizar usuarios' };
        }

        const users = getUsers();
        const userIndex = users.findIndex(u => u.id === userId);

        if (userIndex === -1) {
            return { success: false, error: 'Usuario no encontrado' };
        }

        // Don't allow changing username to an existing one
        if (updates.username && updates.username !== users[userIndex].username) {
            if (users.some(u => u.username === updates.username && u.id !== userId)) {
                return { success: false, error: 'El nombre de usuario ya existe' };
            }
        }

        users[userIndex] = {
            ...users[userIndex],
            ...updates,
            updatedAt: new Date().toISOString(),
            updatedBy: currentUser.username
        };

        saveUsers(users);

        return { success: true, user: users[userIndex] };
    };

    // Delete user (admin only)
    const deleteUser = (userId) => {
        if (!currentUser || currentUser.role !== 'admin') {
            return { success: false, error: 'No tienes permisos para eliminar usuarios' };
        }

        // Prevent deleting yourself
        if (userId === currentUser.id) {
            return { success: false, error: 'No puedes eliminar tu propia cuenta' };
        }

        const users = getUsers();
        const filteredUsers = users.filter(u => u.id !== userId);

        if (filteredUsers.length === users.length) {
            return { success: false, error: 'Usuario no encontrado' };
        }

        saveUsers(filteredUsers);

        return { success: true };
    };

    // Get all users (admin only)
    const getAllUsers = () => {
        if (!currentUser || currentUser.role !== 'admin') {
            return [];
        }

        return getUsers();
    };

    const value = {
        currentUser,
        isAuthenticated,
        loading,
        login,
        logout,
        createUser,
        updateUser,
        deleteUser,
        getAllUsers
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
