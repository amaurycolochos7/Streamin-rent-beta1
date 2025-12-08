import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { calculateExpirationDate, formatDateForInput } from '../utils/dateHelpers';
import { getCustomPlatforms, addCustomPlatform } from '../utils/storage';
import { useAuth } from '../contexts/AuthContext';

const defaultPlatforms = [
    'Netflix',
    'Spotify',
    'Prime Video',
    'HBO Max',
    'Disney+',
    'Apple TV+',
    'Paramount+',
    'Crunchyroll',
    'YouTube Premium',
    'Star+',
    'Max',
    'Peacock',
    'Deezer',
    'Tidal'
];

const RentalForm = ({ rental, onSave, onClose }) => {
    const { currentUser } = useAuth();
    const [formData, setFormData] = useState({
        platform: rental?.platform || '',
        newPlatform: '',
        customerName: rental?.customerName || '',
        accountType: rental?.accountType || 'full', // 'full' or 'profile'
        profileName: rental?.profileName || '',
        duration: rental?.duration || 1,
        price: rental?.price || '',
        accountEmail: rental?.accountEmail || '',
        accountPassword: rental?.accountPassword || '',
        startDate: rental?.startDate ? formatDateForInput(rental.startDate) : formatDateForInput(new Date().toISOString()),
        notes: rental?.notes || ''
    });

    const [errors, setErrors] = useState({});
    const [customPlatforms, setCustomPlatforms] = useState([]);
    const [showAddPlatform, setShowAddPlatform] = useState(false);

    useEffect(() => {
        // Load custom platforms
        setCustomPlatforms(getCustomPlatforms());
    }, []);

    // Combine default and custom platforms
    const allPlatforms = [
        ...defaultPlatforms,
        ...customPlatforms
    ].sort();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleAddCustomPlatform = () => {
        const trimmedName = formData.newPlatform.trim();
        if (trimmedName && addCustomPlatform(trimmedName)) {
            setCustomPlatforms(getCustomPlatforms());
            setFormData(prev => ({ ...prev, platform: trimmedName, newPlatform: '' }));
            setShowAddPlatform(false);
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.platform) newErrors.platform = 'Selecciona una plataforma';
        if (!formData.customerName.trim()) newErrors.customerName = 'Ingresa el nombre del cliente';
        if (formData.accountType === 'profile' && !formData.profileName.trim()) {
            newErrors.profileName = 'Ingresa el nombre del perfil';
        }
        if (!formData.duration || formData.duration < 1) newErrors.duration = 'La duración debe ser mayor a 0';
        if (!formData.price || formData.price < 0) newErrors.price = 'Ingresa un precio válido';
        if (!formData.accountEmail.trim()) newErrors.accountEmail = 'Ingresa el email de la cuenta';
        if (!formData.accountPassword.trim()) newErrors.accountPassword = 'Ingresa la contraseña de la cuenta';
        if (!formData.startDate) newErrors.startDate = 'Selecciona una fecha de inicio';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validate()) return;

        const expirationDate = calculateExpirationDate(formData.startDate, formData.duration);

        const rentalData = {
            platform: formData.platform,
            customerName: formData.customerName,
            accountType: formData.accountType,
            profileName: formData.accountType === 'profile' ? formData.profileName : '',
            duration: parseInt(formData.duration),
            price: parseFloat(formData.price),
            accountEmail: formData.accountEmail,
            accountPassword: formData.accountPassword,
            startDate: new Date(formData.startDate).toISOString(),
            expirationDate,
            notes: formData.notes,
            replacements: rental?.replacements || []
        };

        onSave(rentalData);
    };

    // Get currency symbol from user settings
    const currencySymbol = currentUser?.currency || '$';

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">
                        {rental ? 'Editar Renta' : 'Nueva Renta'}
                    </h2>
                    <button onClick={onClose} className="modal-close">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <div className="flex-between" style={{ marginBottom: 'var(--spacing-sm)' }}>
                            <label className="form-label" style={{ margin: 0 }}>Plataforma *</label>
                            <button
                                type="button"
                                onClick={() => setShowAddPlatform(!showAddPlatform)}
                                className="btn btn-ghost btn-sm flex gap-sm"
                            >
                                <Plus size={16} />
                                {showAddPlatform ? 'Cancelar' : 'Nueva'}
                            </button>
                        </div>

                        {showAddPlatform ? (
                            <div style={{
                                padding: 'var(--spacing-md)',
                                background: 'rgba(168, 85, 247, 0.1)',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid rgba(168, 85, 247, 0.3)'
                            }}>
                                <div style={{ marginBottom: 'var(--spacing-sm)', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                                    Agregar nueva plataforma (se guardará globalmente)
                                </div>
                                <div className="flex gap-sm">
                                    <input
                                        type="text"
                                        name="newPlatform"
                                        value={formData.newPlatform}
                                        onChange={handleChange}
                                        className="form-input"
                                        placeholder="Nombre de la plataforma"
                                        style={{ flex: 1 }}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddCustomPlatform}
                                        className="btn btn-primary btn-sm"
                                        disabled={!formData.newPlatform.trim()}
                                    >
                                        Agregar
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <select
                                name="platform"
                                value={formData.platform}
                                onChange={handleChange}
                                className="form-select"
                                style={{
                                    fontSize: '1rem',
                                    padding: '0.875rem 1rem'
                                }}
                            >
                                <option value="">Selecciona una plataforma</option>
                                {allPlatforms.map(platform => (
                                    <option key={platform} value={platform}>
                                        {platform}
                                    </option>
                                ))}
                            </select>
                        )}
                        {errors.platform && <div style={{ color: 'var(--color-danger)', fontSize: '0.875rem', marginTop: 'var(--spacing-xs)' }}>{errors.platform}</div>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Nombre del Cliente *</label>
                        <input
                            type="text"
                            name="customerName"
                            value={formData.customerName}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Ej: Juan Pérez"
                        />
                        {errors.customerName && <div style={{ color: 'var(--color-danger)', fontSize: '0.875rem', marginTop: 'var(--spacing-xs)' }}>{errors.customerName}</div>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Tipo de Cuenta *</label>
                        <select
                            name="accountType"
                            value={formData.accountType}
                            onChange={handleChange}
                            className="form-select"
                        >
                            <option value="full">Cuenta Completa</option>
                            <option value="profile">Perfil</option>
                        </select>
                    </div>

                    {formData.accountType === 'profile' && (
                        <div className="form-group">
                            <label className="form-label">Nombre del Perfil *</label>
                            <input
                                type="text"
                                name="profileName"
                                value={formData.profileName}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Ej: Perfil 1, Usuario Premium"
                            />
                            {errors.profileName && <div style={{ color: 'var(--color-danger)', fontSize: '0.875rem', marginTop: 'var(--spacing-xs)' }}>{errors.profileName}</div>}
                        </div>
                    )}

                    <div className="flex gap-md">
                        <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label">Duración (meses) *</label>
                            <input
                                type="number"
                                name="duration"
                                value={formData.duration}
                                onChange={handleChange}
                                className="form-input"
                                min="1"
                            />
                            {errors.duration && <div style={{ color: 'var(--color-danger)', fontSize: '0.875rem', marginTop: 'var(--spacing-xs)' }}>{errors.duration}</div>}
                        </div>

                        <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label">Precio ({currencySymbol}) *</label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                className="form-input"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                            />
                            {errors.price && <div style={{ color: 'var(--color-danger)', fontSize: '0.875rem', marginTop: 'var(--spacing-xs)' }}>{errors.price}</div>}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Fecha de Inicio *</label>
                        <input
                            type="date"
                            name="startDate"
                            value={formData.startDate}
                            onChange={handleChange}
                            className="form-input"
                        />
                        {errors.startDate && <div style={{ color: 'var(--color-danger)', fontSize: '0.875rem', marginTop: 'var(--spacing-xs)' }}>{errors.startDate}</div>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email de la Cuenta *</label>
                        <input
                            type="email"
                            name="accountEmail"
                            value={formData.accountEmail}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="cuenta@ejemplo.com"
                        />
                        {errors.accountEmail && <div style={{ color: 'var(--color-danger)', fontSize: '0.875rem', marginTop: 'var(--spacing-xs)' }}>{errors.accountEmail}</div>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Contraseña de la Cuenta *</label>
                        <input
                            type="text"
                            name="accountPassword"
                            value={formData.accountPassword}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="••••••••"
                        />
                        {errors.accountPassword && <div style={{ color: 'var(--color-danger)', fontSize: '0.875rem', marginTop: 'var(--spacing-xs)' }}>{errors.accountPassword}</div>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Notas (Opcional)</label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            className="form-textarea"
                            placeholder="Información adicional..."
                            rows="3"
                        />
                    </div>

                    <div className="flex gap-md" style={{ justifyContent: 'flex-end', marginTop: 'var(--spacing-xl)' }}>
                        <button type="button" onClick={onClose} className="btn btn-ghost">
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary">
                            {rental ? 'Guardar Cambios' : 'Crear Renta'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RentalForm;
