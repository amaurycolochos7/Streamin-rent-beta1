import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserByUsername, saveUser, getUsers, deleteUser } from '../utils/storage';
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

    // Session management with localStorage (for client-side only)
    const saveSession = (user) => {
        if (user) {
            localStorage.setItem('session', JSON.stringify({
                userId: user.id,
                username: user.username,
                role: user.role,
                currency: user.currency
            }));
        } else {
            localStorage.removeItem('session');
        }
    };

    const getSession = () => {
        try {
            const session = localStorage.getItem('session');
            return session ? JSON.parse(session) : null;
        } catch {
            return null;
        }
    };

    // Initialize and restore session on mount
    useEffect(() => {
        const restoreSession = async () => {
            const session = getSession();

            if (session) {
                // Verify user still exists in Supabase
                const user = await getUserByUsername(session.username);

                if (user) {
                    setCurrentUser({
                        id: user.id,
                        username: user.username,
                        fullName: user.full_name,
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
        };

        restoreSession();
    }, []);

    // Login function
    const login = async (username, password) => {
        try {
            const user = await getUserByUsername(username);

            if (!user) {
                return { success: false, error: 'Usuario no encontrado' };
            }

            // Validate password
            const isValid = validatePassword(password, user.password);

            if (!isValid) {
                return { success: false, error: 'Contraseña incorrecta' };
            }

            // Set user session
            const sessionUser = {
                id: user.id,
                username: user.username,
                fullName: user.full_name,
                role: user.role,
                currency: user.currency || '$'
            };

            setCurrentUser(sessionUser);
            setIsAuthenticated(true);
            saveSession(sessionUser);

            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: 'Error al iniciar sesión' };
        }
    };

    // Logout function
    const logout = () => {
        setCurrentUser(null);
        setIsAuthenticated(false);
        saveSession(null);
    };

    // Create new user
    const createUser = async (userData) => {
        try {
            // Check if username already exists
            const existing = await getUserByUsername(userData.username);

            if (existing) {
                return { success: false, error: 'El nombre de usuario ya existe' };
            }

            // Hash password
            const hashedPassword = hashPassword(userData.password);

            // Save user to Supabase
            const newUser = await saveUser({
                username: userData.username,
                password: hashedPassword,
                fullName: userData.fullName,
                role: userData.role || 'user',
                currency: userData.currency || '$'
            });

            return { success: true, user: newUser };
        } catch (error) {
            console.error('Create user error:', error);
            return { success: false, error: 'Error al crear usuario' };
        }
    };

    // Update user
    const updateUser = async (userId, updates) => {
        try {
            const users = await getUsers();
            const user = users.find(u => u.id === userId);

            if (!user) {
                return { success: false, error: 'Usuario no encontrado' };
            }

            // Check if username is being changed and if it's taken
            if (updates.username && updates.username !== user.username) {
                const existing = await getUserByUsername(updates.username);
                if (existing && existing.id !== userId) {
                    return { success: false, error: 'El nombre de usuario ya existe' };
                }
            }

            // Prepare update data
            const updateData = {
                id: userId,
                username: updates.username || user.username,
                fullName: updates.fullName || user.full_name,
                role: updates.role || user.role,
                currency: updates.currency || user.currency,
                password: updates.password ? hashPassword(updates.password) : user.password
            };

            // Save to Supabase
            const updatedUser = await saveUser(updateData);

            // Update current user if it's the logged-in user
            if (currentUser && currentUser.id === userId) {
                const newUserData = {
                    id: updatedUser.id,
                    username: updatedUser.username,
                    fullName: updatedUser.full_name,
                    role: updatedUser.role,
                    currency: updatedUser.currency
                };
                setCurrentUser(newUserData);
                saveSession(newUserData);
            }

            return { success: true, user: updatedUser };
        } catch (error) {
            console.error('Update user error:', error);
            return { success: false, error: 'Error al actualizar usuario' };
        }
    };

    // Delete user
    const removeUser = async (userId) => {
        try {
            // Cannot delete yourself
            if (currentUser && currentUser.id === userId) {
                return { success: false, error: 'No puedes eliminar tu propia cuenta' };
            }

            // Cannot delete if it's the last admin
            const users = await getUsers();
            const admins = users.filter(u => u.role === 'admin');

            const userToDelete = users.find(u => u.id === userId);
            if (userToDelete && userToDelete.role === 'admin' && admins.length <= 1) {
                return { success: false, error: 'No puedes eliminar el último administrador' };
            }

            // Delete from Supabase
            const success = await deleteUser(userId);

            if (!success) {
                return { success: false, error: 'Error al eliminar usuario' };
            }

            return { success: true };
        } catch (error) {
            console.error('Delete user error:', error);
            return { success: false, error: 'Error al eliminar usuario' };
        }
    };

    const value = {
        currentUser,
        isAuthenticated,
        loading,
        login,
        logout,
        createUser,
        updateUser,
        deleteUser: removeUser,
        getAllUsers: getUsers // Export direct access to users list
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
