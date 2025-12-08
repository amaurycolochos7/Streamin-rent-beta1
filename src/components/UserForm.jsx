import React, { useState } from 'react';
import { X } from 'lucide-react';

const UserForm = ({ user, onSave, onClose }) => {
    const [formData, setFormData] = useState({
        username: user?.username || '',
        password: user ? '' : '', // Don't pre-fill password for edit
        role: user?.role || 'user',
        currency: user?.currency || '$'
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.username.trim()) {
            newErrors.username = 'Ingresa un nombre de usuario';
        } else if (formData.username.length < 3) {
            newErrors.username = 'El nombre debe tener al menos 3 caracteres';
        }

        if (!user && !formData.password) {
            newErrors.password = 'Ingresa una contraseña';
        } else if (formData.password && formData.password.length < 6) {
            newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
        }

        if (!formData.role) {
            newErrors.role = 'Selecciona un rol';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validate()) return;

        const userData = {
            username: formData.username,
            role: formData.role,
            currency: formData.currency
        };

        // Only include password if it's set (new user or password change)
        if (formData.password) {
            userData.password = formData.password;
        }

        onSave(userData);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                <div className="modal-header">
                    <h2 className="modal-title">
                        {user ? 'Editar Usuario' : 'Nuevo Usuario'}
                    </h2>
                    <button onClick={onClose} className="modal-close">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Nombre de Usuario *</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="usuario123"
                            disabled={!!user} // Can't change username when editing
                        />
                        {errors.username && <div style={{ color: 'var(--color-danger)', fontSize: '0.875rem', marginTop: 'var(--spacing-xs)' }}>{errors.username}</div>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            Contraseña {user ? '(Dejar en blanco para mantener actual)' : '*'}
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="••••••••"
                        />
                        {errors.password && <div style={{ color: 'var(--color-danger)', fontSize: '0.875rem', marginTop: 'var(--spacing-xs)' }}>{errors.password}</div>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Rol *</label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="form-select"
                        >
                            <option value="user">Usuario</option>
                            <option value="admin">Administrador</option>
                        </select>
                        {errors.role && <div style={{ color: 'var(--color-danger)', fontSize: '0.875rem', marginTop: 'var(--spacing-xs)' }}>{errors.role}</div>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Moneda *</label>
                        <select
                            name="currency"
                            value={formData.currency}
                            onChange={handleChange}
                            className="form-select"
                        >
                            <option value="$">$ - Dólar (USD)</option>
                            <option value="Q">Q - Quetzal (GTQ)</option>
                            <option value="L">L - Lempira (HNL)</option>
                            <option value="C$">C$ - Córdoba (NIO)</option>
                            <option value="₡">₡ - Colón (CRC)</option>
                            <option value="€">€ - Euro (EUR)</option>
                            <option value="£">£ - Libra (GBP)</option>
                            <option value="MXN$">MX$ - Peso Mexicano</option>
                            <option value="ARS$">AR$ - Peso Argentino</option>
                            <option value="COP$">CO$ - Peso Colombiano</option>
                        </select>
                    </div>

                    {formData.role === 'admin' && (
                        <div style={{
                            padding: 'var(--spacing-md)',
                            background: 'rgba(245, 158, 11, 0.1)',
                            border: '1px solid rgba(245, 158, 11, 0.3)',
                            borderRadius: 'var(--radius-md)',
                            marginBottom: 'var(--spacing-lg)',
                            fontSize: '0.875rem'
                        }}>
                            ⚠️ Los administradores pueden crear y gestionar otros usuarios
                        </div>
                    )}

                    <div className="flex gap-md" style={{ justifyContent: 'flex-end', marginTop: 'var(--spacing-xl)' }}>
                        <button type="button" onClick={onClose} className="btn btn-ghost">
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary">
                            {user ? 'Guardar Cambios' : 'Crear Usuario'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserForm;
