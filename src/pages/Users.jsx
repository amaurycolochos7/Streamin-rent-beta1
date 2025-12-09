import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import UserForm from '../components/UserForm';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Edit2, Trash2, Shield, User as UserIcon } from 'lucide-react';
import { formatDate } from '../utils/dateHelpers';

const Users = () => {
    const { getAllUsers, createUser, updateUser, deleteUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showUserForm, setShowUserForm] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const allUsers = await getAllUsers();
            setUsers(allUsers);
        } catch (error) {
            console.error('Error loading users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveUser = async (userData) => {
        let result;

        try {
            if (editingUser) {
                // Update existing user
                result = await updateUser(editingUser.id, userData);
            } else {
                // Create new user
                result = await createUser(userData);
            }

            if (result.success) {
                setShowUserForm(false);
                setEditingUser(null);
                await loadUsers();
            } else {
                alert(result.error);
            }
        } catch (error) {
            console.error('Error saving user:', error);
            alert('Ocurrió un error al guardar el usuario');
        }
    };

    const handleDelete = async (userId) => {
        if (!confirm('¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.')) {
            return;
        }

        try {
            const result = await deleteUser(userId);

            if (result.success) {
                await loadUsers();
            } else {
                alert(result.error);
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Error al eliminar el usuario');
        }
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setShowUserForm(true);
    };

    return (
        <Layout>
            <div>
                <div className="flex-between" style={{ marginBottom: 'var(--spacing-2xl)' }}>
                    <div>
                        <h1 style={{ marginBottom: 'var(--spacing-xs)' }}>
                            Gestión de Usuarios
                        </h1>
                        <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>
                            Administra todos los usuarios del sistema
                        </p>
                    </div>

                    <button
                        onClick={() => {
                            setEditingUser(null);
                            setShowUserForm(true);
                        }}
                        className="btn btn-primary flex gap-sm"
                    >
                        <Plus size={20} />
                        Nuevo Usuario
                    </button>
                </div>

                {/* Users Grid */}
                <div className="grid grid-2">
                    {users.map(user => (
                        <div key={user.id} className="glass-card animate-slide-up">
                            <div className="flex-between" style={{ marginBottom: 'var(--spacing-lg)' }}>
                                <div className="flex gap-md" style={{ alignItems: 'center' }}>
                                    <div style={{
                                        width: '50px',
                                        height: '50px',
                                        borderRadius: '50%',
                                        background: user.role === 'admin'
                                            ? 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))'
                                            : 'linear-gradient(135deg, var(--color-secondary), var(--color-secondary-dark))',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        {user.role === 'admin' ? <Shield size={24} /> : <UserIcon size={24} />}
                                    </div>

                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: 'var(--spacing-xs)' }}>
                                            {user.username}
                                        </div>
                                        <div className={`badge ${user.role === 'admin' ? 'badge-primary' : 'badge-info'}`}>
                                            {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-sm">
                                    <button
                                        onClick={() => handleEdit(user)}
                                        className="btn btn-ghost btn-sm"
                                        title="Editar usuario"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(user.id)}
                                        className="btn btn-danger btn-sm"
                                        title="Eliminar usuario"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div style={{
                                padding: 'var(--spacing-md)',
                                background: 'rgba(255, 255, 255, 0.03)',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--glass-border)'
                            }}>
                                <div className="flex-between" style={{ marginBottom: 'var(--spacing-sm)' }}>
                                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                                        Creado:
                                    </span>
                                    <span style={{ fontSize: '0.875rem' }}>
                                        {formatDate(user.createdAt)}
                                    </span>
                                </div>
                                <div className="flex-between">
                                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                                        Creado por:
                                    </span>
                                    <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                                        {user.createdBy}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {users.length === 0 && (
                    <div className="glass-card text-center" style={{ padding: 'var(--spacing-2xl)' }}>
                        <div style={{
                            fontSize: '4rem',
                            marginBottom: 'var(--spacing-lg)',
                            opacity: 0.3
                        }}>
                            👥
                        </div>
                        <h2>No hay usuarios</h2>
                        <p style={{ color: 'var(--color-text-muted)' }}>
                            Comienza creando un nuevo usuario
                        </p>
                    </div>
                )}
            </div>

            {/* User Form Modal */}
            {showUserForm && (
                <UserForm
                    user={editingUser}
                    onSave={handleSaveUser}
                    onClose={() => {
                        setShowUserForm(false);
                        setEditingUser(null);
                    }}
                />
            )}
        </Layout>
    );
};

export default Users;
