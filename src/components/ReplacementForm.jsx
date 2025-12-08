import React, { useState } from 'react';
import { X } from 'lucide-react';
import { formatDateForInput } from '../utils/dateHelpers';

const ReplacementForm = ({ rental, onSave, onClose }) => {
    const [formData, setFormData] = useState({
        date: formatDateForInput(new Date().toISOString()),
        reason: '',
        newEmail: rental?.accountEmail || '',
        newPassword: rental?.accountPassword || ''
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

        if (!formData.date) newErrors.date = 'Selecciona una fecha';
        if (!formData.reason.trim()) newErrors.reason = 'Ingresa la razón de la reposición';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validate()) return;

        const replacement = {
            date: new Date(formData.date).toISOString(),
            reason: formData.reason,
            newCredentials: {
                email: formData.newEmail,
                password: formData.newPassword
            }
        };

        onSave(replacement);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
                <div className="modal-header">
                    <h2 className="modal-title">
                        Agregar Reposición
                    </h2>
                    <button onClick={onClose} className="modal-close">
                        <X size={24} />
                    </button>
                </div>

                <div style={{
                    padding: 'var(--spacing-md)',
                    background: 'rgba(6, 182, 212, 0.1)',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: 'var(--spacing-lg)',
                    border: '1px solid rgba(6, 182, 212, 0.2)'
                }}>
                    <div style={{ fontWeight: 600, marginBottom: 'var(--spacing-xs)' }}>
                        {rental.platform} - {rental.customerName}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                        Registra la reposición de esta renta
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Fecha de Reposición *</label>
                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            className="form-input"
                        />
                        {errors.date && <div style={{ color: 'var(--color-danger)', fontSize: '0.875rem', marginTop: 'var(--spacing-xs)' }}>{errors.date}</div>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Razón de la Reposición *</label>
                        <textarea
                            name="reason"
                            value={formData.reason}
                            onChange={handleChange}
                            className="form-textarea"
                            placeholder="Ej: Cliente reportó que la cuenta no funciona"
                            rows="3"
                        />
                        {errors.reason && <div style={{ color: 'var(--color-danger)', fontSize: '0.875rem', marginTop: 'var(--spacing-xs)' }}>{errors.reason}</div>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Nuevo Email (Opcional)</label>
                        <input
                            type="email"
                            name="newEmail"
                            value={formData.newEmail}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="nuevo@email.com"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Nueva Contraseña (Opcional)</label>
                        <input
                            type="text"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="nueva contraseña"
                        />
                    </div>

                    <div className="flex gap-md" style={{ justifyContent: 'flex-end', marginTop: 'var(--spacing-xl)' }}>
                        <button type="button" onClick={onClose} className="btn btn-ghost">
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-secondary">
                            Agregar Reposición
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReplacementForm;
