import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Key, User, Package, CircleDot, DollarSign, Layers } from 'lucide-react';
import { calculateExpirationDate, formatDateForInput } from '../utils/dateHelpers';
import { getCustomPlatforms, addCustomPlatform } from '../utils/storage';
import { useAuth } from '../contexts/AuthContext';

const defaultPlatforms = [
    'Netflix', 'Spotify', 'Prime Video', 'HBO Max', 'Disney+',
    'Apple TV+', 'Paramount+', 'Crunchyroll', 'YouTube Premium',
    'Star+', 'Max', 'Peacock', 'Deezer', 'Tidal'
];

const RentalForm = ({ rental, onSave, onClose }) => {
    const { currentUser } = useAuth();
    const [isMobile, setIsMobile] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);

    // Form state
    const [formData, setFormData] = useState({
        customerName: rental?.customerName || '',
        phoneNumber: rental?.phoneNumber || '',
        accountType: rental?.accountType || 'full', // 'full' = Completa, 'profile' = Perfil
        isCombo: rental?.isCombo || false,
        pricingType: rental?.pricingType || (rental?.comboPrice !== undefined && rental?.comboPrice !== null ? 'total' : 'individual'),
        comboPrice: rental?.comboPrice || '',
        duration: rental?.duration || 1,
        startDate: rental?.startDate ? formatDateForInput(rental.startDate) : formatDateForInput(new Date().toISOString()),
        notes: rental?.notes || ''
    });

    // For single account
    const [singleAccount, setSingleAccount] = useState({
        platform: rental?.platform || '',
        profileName: rental?.profileName || '',
        accountEmail: rental?.accountEmail || '',
        accountPassword: rental?.accountPassword || '',
        price: rental?.price || ''
    });

    // For combo - multiple accounts
    const [comboAccounts, setComboAccounts] = useState(
        rental?.accounts || [{
            platform: '',
            profileName: '',
            accountEmail: '',
            accountPassword: '',
            price: ''
        }]
    );

    const [errors, setErrors] = useState({});
    const [customPlatforms, setCustomPlatforms] = useState([]);
    const [showAddPlatform, setShowAddPlatform] = useState(false);
    const [newPlatformName, setNewPlatformName] = useState('');

    // Sync state with rental prop when it changes (for editing)
    useEffect(() => {
        if (rental) {
            setFormData({
                customerName: rental.customerName || '',
                phoneNumber: rental.phoneNumber || '',
                accountType: rental.accountType || 'full',
                isCombo: rental.isCombo || false,
                pricingType: rental.pricingType || (rental.comboPrice !== undefined && rental.comboPrice !== null ? 'total' : 'individual'),
                comboPrice: rental.comboPrice || '',
                duration: rental.duration || 1,
                startDate: rental.startDate ? formatDateForInput(rental.startDate) : formatDateForInput(new Date().toISOString()),
                notes: rental.notes || ''
            });

            setSingleAccount({
                platform: rental.platform || '',
                profileName: rental.profileName || '',
                accountEmail: rental.accountEmail || '',
                accountPassword: rental.accountPassword || '',
                price: rental.price || ''
            });

            if (rental.accounts && rental.accounts.length > 0) {
                setComboAccounts(rental.accounts);
            } else if (!rental.isCombo) {
                // Only reset to empty if NOT editing a combo
                setComboAccounts([{
                    platform: '',
                    profileName: '',
                    accountEmail: '',
                    accountPassword: '',
                    price: ''
                }]);
            }
        }
    }, [rental]);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);

        const loadPlatforms = async () => {
            const platforms = await getCustomPlatforms();
            setCustomPlatforms(platforms);
        };
        loadPlatforms();

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const allPlatforms = [...defaultPlatforms, ...customPlatforms].sort();
    const currencySymbol = currentUser?.currency || '$';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleSingleAccountChange = (e) => {
        const { name, value } = e.target;
        setSingleAccount(prev => ({ ...prev, [name]: value }));
    };

    const handleComboAccountChange = (index, field, value) => {
        setComboAccounts(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const addComboAccount = () => {
        if (comboAccounts.length < 10) {
            setComboAccounts(prev => [...prev, {
                platform: '',
                profileName: '',
                accountEmail: '',
                accountPassword: '',
                price: ''
            }]);
        }
    };

    const removeComboAccount = (index) => {
        if (comboAccounts.length > 1) {
            setComboAccounts(prev => prev.filter((_, i) => i !== index));
        }
    };

    const handleAddCustomPlatform = async () => {
        const trimmed = newPlatformName.trim();
        if (trimmed) {
            const success = await addCustomPlatform(trimmed);
            if (success) {
                const platforms = await getCustomPlatforms();
                setCustomPlatforms(platforms);
                setNewPlatformName('');
                setShowAddPlatform(false);
            }
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.customerName.trim()) newErrors.customerName = 'Requerido';
        if (!formData.duration || formData.duration < 1) newErrors.duration = 'Inválido';
        if (!formData.startDate) newErrors.startDate = 'Requerido';

        if (formData.isCombo) {
            if (formData.pricingType === 'total' && (!formData.comboPrice || formData.comboPrice <= 0)) {
                newErrors.comboPrice = 'Ingresa precio';
            }
            comboAccounts.forEach((acc, i) => {
                if (!acc.platform) newErrors[`account_${i}_platform`] = 'Requerido';
                if (!acc.accountEmail.trim()) newErrors[`account_${i}_email`] = 'Requerido';
                if (!acc.accountPassword.trim()) newErrors[`account_${i}_password`] = 'Requerido';
                if (formData.pricingType === 'individual' && (!acc.price || acc.price <= 0)) {
                    newErrors[`account_${i}_price`] = 'Requerido';
                }
            });
        } else {
            if (!singleAccount.platform) newErrors.platform = 'Requerido';
            if (!singleAccount.accountEmail.trim()) newErrors.accountEmail = 'Requerido';
            if (!singleAccount.accountPassword.trim()) newErrors.accountPassword = 'Requerido';
            if (!singleAccount.price || singleAccount.price <= 0) newErrors.price = 'Requerido';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;

        const expirationDate = calculateExpirationDate(formData.startDate, formData.duration);

        let rentalData;
        if (formData.isCombo) {
            const totalPrice = formData.pricingType === 'total'
                ? parseFloat(formData.comboPrice)
                : comboAccounts.reduce((sum, acc) => sum + parseFloat(acc.price || 0), 0);

            rentalData = {
                customerName: formData.customerName,
                phoneNumber: formData.phoneNumber || '',
                accountType: formData.accountType,
                isCombo: true,
                pricingType: formData.pricingType,
                comboPrice: formData.pricingType === 'total' ? parseFloat(formData.comboPrice) : null,
                price: totalPrice,
                platform: comboAccounts.map(a => a.platform).join(' + '),
                accounts: comboAccounts.map(acc => ({
                    platform: acc.platform,
                    profileName: acc.profileName || '',
                    accountEmail: acc.accountEmail,
                    accountPassword: acc.accountPassword,
                    price: formData.pricingType === 'individual' ? parseFloat(acc.price) : null
                })),
                accountEmail: comboAccounts[0]?.accountEmail || '',
                accountPassword: comboAccounts[0]?.accountPassword || '',
                duration: parseInt(formData.duration),
                startDate: new Date(formData.startDate).toISOString(),
                expirationDate,
                notes: formData.notes,
                replacements: rental?.replacements || []
            };
        } else {
            rentalData = {
                customerName: formData.customerName,
                phoneNumber: formData.phoneNumber || '',
                accountType: formData.accountType,
                isCombo: false,
                platform: singleAccount.platform,
                profileName: formData.accountType === 'profile' ? singleAccount.profileName : '',
                accountEmail: singleAccount.accountEmail,
                accountPassword: singleAccount.accountPassword,
                price: parseFloat(singleAccount.price),
                duration: parseInt(formData.duration),
                startDate: new Date(formData.startDate).toISOString(),
                expirationDate,
                notes: formData.notes,
                replacements: rental?.replacements || []
            };
        }

        onSave(rentalData);
    };

    const getTotalPrice = () => {
        if (!formData.isCombo) return parseFloat(singleAccount.price) || 0;
        if (formData.pricingType === 'total') return parseFloat(formData.comboPrice) || 0;
        return comboAccounts.reduce((sum, acc) => sum + parseFloat(acc.price || 0), 0);
    };

    // MOBILE VERSION
    if (isMobile) {
        return (
            <div style={{
                position: 'fixed', inset: 0, background: 'rgba(10, 1, 24, 0.98)',
                zIndex: 1002, display: 'flex', flexDirection: 'column', overflow: 'hidden'
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '14px 16px', borderBottom: '1px solid var(--glass-border)'
                }}>
                    <h2 style={{
                        margin: 0, fontSize: '1rem',
                        background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-secondary-light))',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                    }}>
                        {rental ? 'Editar' : 'Nueva Renta'}
                    </h2>
                    <button onClick={onClose} style={{
                        width: '32px', height: '32px', borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.1)', border: 'none',
                        color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                    }}>
                        <X size={18} />
                    </button>
                </div>

                {/* Step Indicator */}
                <div style={{ display: 'flex', gap: '4px', padding: '10px 16px', background: 'rgba(255, 255, 255, 0.02)' }}>
                    {[1, 2, 3].map(step => (
                        <div key={step} onClick={() => setCurrentStep(step)} style={{
                            flex: 1, height: '3px', borderRadius: '2px', cursor: 'pointer',
                            background: currentStep >= step ? 'var(--color-primary)' : 'rgba(255, 255, 255, 0.1)'
                        }} />
                    ))}
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} style={{
                    flex: 1, overflowY: 'auto', padding: '14px 16px',
                    display: 'flex', flexDirection: 'column', gap: '12px'
                }}>
                    {/* STEP 1: Customer & Account Type */}
                    {currentStep === 1 && (
                        <>
                            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                                PASO 1: Cliente y Tipo de Cuenta
                            </div>

                            {/* Customer */}
                            <div>
                                <label style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>Cliente *</label>
                                <input type="text" name="customerName" value={formData.customerName} onChange={handleChange}
                                    placeholder="Nombre del cliente" style={{
                                        width: '100%', padding: '11px', fontSize: '0.85rem',
                                        background: 'rgba(26, 10, 46, 0.8)',
                                        border: errors.customerName ? '1px solid var(--color-danger)' : '1px solid var(--glass-border)',
                                        borderRadius: '8px', color: 'white'
                                    }}
                                />
                            </div>

                            {/* Phone */}
                            <div>
                                <label style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>Teléfono (opcional)</label>
                                <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange}
                                    placeholder="+52 123 456 7890" style={{
                                        width: '100%', padding: '11px', fontSize: '0.85rem',
                                        background: 'rgba(26, 10, 46, 0.8)', border: '1px solid var(--glass-border)',
                                        borderRadius: '8px', color: 'white'
                                    }}
                                />
                            </div>

                            {/* Account Type: Completa or Perfil - PRIMERO */}
                            <div>
                                <label style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '6px' }}>Tipo de Cuenta *</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button type="button" onClick={() => setFormData(p => ({ ...p, accountType: 'full' }))} style={{
                                        flex: 1, padding: '12px 10px', borderRadius: '10px',
                                        border: formData.accountType === 'full' ? '2px solid var(--color-primary)' : '1px solid var(--glass-border)',
                                        background: formData.accountType === 'full' ? 'rgba(168, 85, 247, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                                        color: 'white', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer'
                                    }}>
                                        <Key size={14} style={{ marginRight: '6px' }} /> Completa
                                    </button>
                                    <button type="button" onClick={() => setFormData(p => ({ ...p, accountType: 'profile' }))} style={{
                                        flex: 1, padding: '12px 10px', borderRadius: '10px',
                                        border: formData.accountType === 'profile' ? '2px solid var(--color-secondary)' : '1px solid var(--glass-border)',
                                        background: formData.accountType === 'profile' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                                        color: 'white', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer'
                                    }}>
                                        <User size={14} style={{ marginRight: '6px' }} /> Perfil
                                    </button>
                                </div>
                            </div>

                            {/* Combo or Solo - DESPUÉS */}
                            <div style={{
                                padding: '12px', background: 'rgba(255, 255, 255, 0.03)',
                                borderRadius: '10px', border: '1px solid var(--glass-border)'
                            }}>
                                <label style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '6px' }}>
                                    ¿Es Combo o Solo? *
                                </label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button type="button" onClick={() => setFormData(p => ({ ...p, isCombo: false }))} style={{
                                        flex: 1, padding: '10px', borderRadius: '8px',
                                        border: !formData.isCombo ? '2px solid var(--color-success)' : '1px solid var(--glass-border)',
                                        background: !formData.isCombo ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                                        color: 'white', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer'
                                    }}>
                                        <CircleDot size={14} style={{ marginRight: '6px' }} /> Solo
                                    </button>
                                    <button type="button" onClick={() => setFormData(p => ({ ...p, isCombo: true }))} style={{
                                        flex: 1, padding: '10px', borderRadius: '8px',
                                        border: formData.isCombo ? '2px solid var(--color-warning)' : '1px solid var(--glass-border)',
                                        background: formData.isCombo ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                                        color: 'white', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer'
                                    }}>
                                        <Package size={14} style={{ marginRight: '6px' }} /> Combo
                                    </button>
                                </div>
                            </div>

                            {/* If Combo - Pricing Type */}
                            {formData.isCombo && (
                                <div style={{
                                    padding: '12px', background: 'rgba(245, 158, 11, 0.1)',
                                    borderRadius: '10px', border: '1px solid rgba(245, 158, 11, 0.3)'
                                }}>
                                    <label style={{ fontSize: '0.7rem', color: 'var(--color-warning)', display: 'block', marginBottom: '6px' }}>Tipo de Precio del Combo</label>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        <button type="button" onClick={() => setFormData(p => ({ ...p, pricingType: 'total' }))} style={{
                                            flex: 1, padding: '10px 8px', borderRadius: '8px',
                                            border: formData.pricingType === 'total' ? '2px solid var(--color-success)' : '1px solid var(--glass-border)',
                                            background: formData.pricingType === 'total' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
                                            color: 'white', fontSize: '0.7rem', cursor: 'pointer'
                                        }}>
                                            <DollarSign size={13} style={{ marginRight: '4px' }} /> Precio Total
                                        </button>
                                        <button type="button" onClick={() => setFormData(p => ({ ...p, pricingType: 'individual' }))} style={{
                                            flex: 1, padding: '10px 8px', borderRadius: '8px',
                                            border: formData.pricingType === 'individual' ? '2px solid var(--color-info)' : '1px solid var(--glass-border)',
                                            background: formData.pricingType === 'individual' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                                            color: 'white', fontSize: '0.7rem', cursor: 'pointer'
                                        }}>
                                            <Layers size={13} style={{ marginRight: '4px' }} /> Por Cuenta
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* STEP 2: Accounts */}
                    {currentStep === 2 && (
                        <>
                            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                                PASO 2: {formData.isCombo ? 'Cuentas del Combo' : 'Datos de la Cuenta'}
                            </div>

                            {!formData.isCombo ? (
                                /* SINGLE ACCOUNT */
                                <>
                                    {/* Platform */}
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                            <label style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Plataforma *</label>
                                            <button type="button" onClick={() => setShowAddPlatform(!showAddPlatform)} style={{
                                                background: 'none', border: 'none', color: 'var(--color-primary-light)',
                                                fontSize: '0.65rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px'
                                            }}>
                                                <Plus size={10} /> Nueva
                                            </button>
                                        </div>
                                        {showAddPlatform ? (
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                <input type="text" value={newPlatformName} onChange={(e) => setNewPlatformName(e.target.value)}
                                                    placeholder="Nombre" style={{
                                                        flex: 1, padding: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--glass-border)',
                                                        borderRadius: '8px', color: 'white', fontSize: '0.8rem'
                                                    }}
                                                />
                                                <button type="button" onClick={handleAddCustomPlatform} style={{
                                                    padding: '10px 12px', background: 'var(--color-primary)', border: 'none',
                                                    borderRadius: '8px', color: 'white', fontSize: '0.75rem', cursor: 'pointer'
                                                }}>OK</button>
                                            </div>
                                        ) : (
                                            <select name="platform" value={singleAccount.platform} onChange={handleSingleAccountChange} style={{
                                                width: '100%', padding: '11px', fontSize: '0.85rem',
                                                background: '#1a0a2e', border: errors.platform ? '1px solid var(--color-danger)' : '1px solid var(--glass-border)',
                                                borderRadius: '8px', color: 'white'
                                            }}>
                                                <option value="">Seleccionar...</option>
                                                {allPlatforms.map(p => <option key={p} value={p}>{p}</option>)}
                                            </select>
                                        )}
                                    </div>

                                    {/* Profile Name (if Perfil type) */}
                                    {formData.accountType === 'profile' && (
                                        <div>
                                            <label style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>Nombre del Perfil *</label>
                                            <input type="text" name="profileName" value={singleAccount.profileName} onChange={handleSingleAccountChange}
                                                placeholder="Ej: Perfil 1, Usuario" style={{
                                                    width: '100%', padding: '11px', fontSize: '0.85rem',
                                                    background: 'rgba(26, 10, 46, 0.8)', border: '1px solid var(--glass-border)',
                                                    borderRadius: '8px', color: 'white'
                                                }}
                                            />
                                        </div>
                                    )}

                                    {/* Credentials */}
                                    <input type="email" name="accountEmail" value={singleAccount.accountEmail} onChange={handleSingleAccountChange}
                                        placeholder="Email de la cuenta" style={{
                                            width: '100%', padding: '11px', fontSize: '0.85rem',
                                            background: 'rgba(26, 10, 46, 0.8)', border: errors.accountEmail ? '1px solid var(--color-danger)' : '1px solid var(--glass-border)',
                                            borderRadius: '8px', color: 'white'
                                        }}
                                    />
                                    <input type="text" name="accountPassword" value={singleAccount.accountPassword} onChange={handleSingleAccountChange}
                                        placeholder="Contraseña" style={{
                                            width: '100%', padding: '11px', fontSize: '0.85rem',
                                            background: 'rgba(26, 10, 46, 0.8)', border: errors.accountPassword ? '1px solid var(--color-danger)' : '1px solid var(--glass-border)',
                                            borderRadius: '8px', color: 'white'
                                        }}
                                    />

                                    {/* Price */}
                                    <div>
                                        <label style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>Precio ({currencySymbol}) *</label>
                                        <input type="number" name="price" value={singleAccount.price} onChange={handleSingleAccountChange}
                                            placeholder="0" min="0" style={{
                                                width: '100%', padding: '11px', fontSize: '0.85rem',
                                                background: 'rgba(26, 10, 46, 0.8)', border: errors.price ? '1px solid var(--color-danger)' : '1px solid var(--glass-border)',
                                                borderRadius: '8px', color: 'white'
                                            }}
                                        />
                                    </div>
                                </>
                            ) : (
                                /* COMBO - MULTIPLE ACCOUNTS */
                                <>
                                    {/* Combo summary */}
                                    <div style={{
                                        padding: '10px', background: 'rgba(245, 158, 11, 0.1)',
                                        borderRadius: '8px', marginBottom: '4px', fontSize: '0.75rem', color: 'var(--color-warning)'
                                    }}>
                                        <Package size={14} style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'middle' }} /> Combo de {formData.accountType === 'full' ? 'Cuentas Completas' : 'Perfiles'}
                                        {' • '} {formData.pricingType === 'total' ? 'Precio Total' : 'Precio por Cuenta'}
                                    </div>

                                    {/* Combo Price if total pricing */}
                                    {formData.pricingType === 'total' && (
                                        <div style={{
                                            padding: '12px', background: 'rgba(16, 185, 129, 0.1)',
                                            borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.3)', marginBottom: '8px'
                                        }}>
                                            <label style={{ fontSize: '0.7rem', color: 'var(--color-success)', display: 'block', marginBottom: '4px' }}>Precio Total del Combo ({currencySymbol}) *</label>
                                            <input type="number" name="comboPrice" value={formData.comboPrice} onChange={handleChange}
                                                placeholder="0" min="0" style={{
                                                    width: '100%', padding: '11px', fontSize: '1rem', fontWeight: 700,
                                                    background: 'rgba(0, 0, 0, 0.3)', border: errors.comboPrice ? '1px solid var(--color-danger)' : '1px solid rgba(16, 185, 129, 0.3)',
                                                    borderRadius: '8px', color: 'var(--color-success)'
                                                }}
                                            />
                                        </div>
                                    )}

                                    {/* Accounts List */}
                                    {comboAccounts.map((acc, index) => (
                                        <div key={index} style={{
                                            padding: '12px', background: 'rgba(255, 255, 255, 0.03)',
                                            borderRadius: '10px', border: '1px solid var(--glass-border)'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-primary-light)' }}>
                                                    {formData.accountType === 'full' ? <Key size={12} /> : <User size={12} />} Cuenta {index + 1}
                                                </span>
                                                {comboAccounts.length > 1 && (
                                                    <button type="button" onClick={() => removeComboAccount(index)} style={{
                                                        background: 'rgba(239, 68, 68, 0.2)', border: 'none', borderRadius: '6px',
                                                        padding: '4px 8px', color: 'var(--color-danger)', fontSize: '0.65rem', cursor: 'pointer',
                                                        display: 'flex', alignItems: 'center', gap: '2px'
                                                    }}>
                                                        <Trash2 size={10} /> Quitar
                                                    </button>
                                                )}
                                            </div>

                                            {/* Platform */}
                                            <select value={acc.platform} onChange={(e) => handleComboAccountChange(index, 'platform', e.target.value)} style={{
                                                width: '100%', padding: '10px', fontSize: '0.8rem', marginBottom: '6px',
                                                background: '#1a0a2e', border: '1px solid var(--glass-border)',
                                                borderRadius: '8px', color: 'white'
                                            }}>
                                                <option value="">Plataforma...</option>
                                                {allPlatforms.map(p => <option key={p} value={p}>{p}</option>)}
                                            </select>

                                            {/* Profile Name (if Perfil type) */}
                                            {formData.accountType === 'profile' && (
                                                <input type="text" value={acc.profileName} onChange={(e) => handleComboAccountChange(index, 'profileName', e.target.value)}
                                                    placeholder="Nombre del perfil" style={{
                                                        width: '100%', padding: '10px', fontSize: '0.8rem', marginBottom: '6px',
                                                        background: 'rgba(26, 10, 46, 0.8)', border: '1px solid var(--glass-border)',
                                                        borderRadius: '8px', color: 'white'
                                                    }}
                                                />
                                            )}

                                            {/* Credentials */}
                                            <input type="email" value={acc.accountEmail} onChange={(e) => handleComboAccountChange(index, 'accountEmail', e.target.value)}
                                                placeholder="Email" style={{
                                                    width: '100%', padding: '10px', fontSize: '0.8rem', marginBottom: '6px',
                                                    background: 'rgba(26, 10, 46, 0.8)', border: '1px solid var(--glass-border)',
                                                    borderRadius: '8px', color: 'white'
                                                }}
                                            />
                                            <input type="text" value={acc.accountPassword} onChange={(e) => handleComboAccountChange(index, 'accountPassword', e.target.value)}
                                                placeholder="Contraseña" style={{
                                                    width: '100%', padding: '10px', fontSize: '0.8rem',
                                                    background: 'rgba(26, 10, 46, 0.8)', border: '1px solid var(--glass-border)',
                                                    borderRadius: '8px', color: 'white'
                                                }}
                                            />

                                            {/* Individual Price */}
                                            {formData.pricingType === 'individual' && (
                                                <input type="number" value={acc.price} onChange={(e) => handleComboAccountChange(index, 'price', e.target.value)}
                                                    placeholder={`Precio (${currencySymbol})`} min="0" style={{
                                                        width: '100%', padding: '10px', fontSize: '0.8rem', marginTop: '6px',
                                                        background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)',
                                                        borderRadius: '8px', color: 'var(--color-info)'
                                                    }}
                                                />
                                            )}
                                        </div>
                                    ))}

                                    {/* Add Account Button */}
                                    <button type="button" onClick={addComboAccount} style={{
                                        width: '100%', padding: '12px', borderRadius: '10px',
                                        border: '2px dashed rgba(168, 85, 247, 0.4)', background: 'transparent',
                                        color: 'var(--color-primary-light)', fontSize: '0.8rem', fontWeight: 600,
                                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                                    }}>
                                        <Plus size={16} /> Agregar Otra Cuenta
                                    </button>
                                </>
                            )}
                        </>
                    )}

                    {/* STEP 3: Duration & Summary */}
                    {currentStep === 3 && (
                        <>
                            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                                PASO 3: Duración y Resumen
                            </div>

                            {/* Duration & Date */}
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>Meses *</label>
                                    <input type="number" name="duration" value={formData.duration} onChange={handleChange}
                                        min="1" style={{
                                            width: '100%', padding: '11px', fontSize: '0.85rem',
                                            background: 'rgba(26, 10, 46, 0.8)', border: '1px solid var(--glass-border)',
                                            borderRadius: '8px', color: 'white'
                                        }}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>Inicio *</label>
                                    <input type="date" name="startDate" value={formData.startDate} onChange={handleChange}
                                        style={{
                                            width: '100%', padding: '11px', fontSize: '0.85rem',
                                            background: 'rgba(26, 10, 46, 0.8)', border: '1px solid var(--glass-border)',
                                            borderRadius: '8px', color: 'white'
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <label style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px' }}>Notas (opcional)</label>
                                <textarea name="notes" value={formData.notes} onChange={handleChange}
                                    placeholder="Info adicional..." rows="2" style={{
                                        width: '100%', padding: '11px', fontSize: '0.85rem',
                                        background: 'rgba(26, 10, 46, 0.8)', border: '1px solid var(--glass-border)',
                                        borderRadius: '8px', color: 'white', resize: 'none'
                                    }}
                                />
                            </div>

                            {/* Summary Card */}
                            <div style={{
                                padding: '14px', marginTop: '8px',
                                background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(6, 182, 212, 0.1))',
                                borderRadius: '12px', border: '1px solid rgba(168, 85, 247, 0.3)'
                            }}>
                                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginBottom: '10px' }}>RESUMEN</div>

                                <div style={{ marginBottom: '8px' }}>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'white' }}>{formData.customerName || '-'}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                            {formData.accountType === 'full' ? <Key size={11} /> : <User size={11} />}
                                            {formData.accountType === 'full' ? 'Completa' : 'Perfil'}
                                        </span>
                                        <span style={{ opacity: 0.5 }}>•</span>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                            {formData.isCombo ? <Package size={11} /> : <CircleDot size={11} />}
                                            {formData.isCombo ? `Combo (${comboAccounts.length})` : 'Solo'}
                                        </span>
                                    </div>
                                </div>

                                {formData.isCombo ? (
                                    <div style={{ marginBottom: '10px' }}>
                                        {comboAccounts.filter(a => a.platform).map((acc, i) => (
                                            <span key={i} style={{
                                                display: 'inline-block', padding: '3px 8px', marginRight: '4px', marginBottom: '4px',
                                                background: 'rgba(255, 255, 255, 0.1)', borderRadius: '6px',
                                                fontSize: '0.7rem', color: 'var(--color-text-secondary)'
                                            }}>
                                                {acc.platform} {formData.pricingType === 'individual' && acc.price ? `(${currencySymbol}${acc.price})` : ''}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '10px' }}>
                                        {singleAccount.platform || '-'}
                                    </div>
                                )}

                                <div style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                                }}>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{formData.duration} mes(es)</span>
                                    <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-success)' }}>
                                        {currencySymbol}{getTotalPrice().toFixed(0)}
                                    </span>
                                </div>
                            </div>
                        </>
                    )}
                </form>

                {/* Footer */}
                <div style={{ padding: '14px 16px', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '10px' }}>
                    {currentStep > 1 && (
                        <button type="button" onClick={() => setCurrentStep(s => s - 1)} style={{
                            flex: 1, padding: '13px', borderRadius: '10px',
                            border: '1px solid var(--glass-border)', background: 'transparent',
                            color: 'var(--color-text-primary)', fontSize: '0.85rem', cursor: 'pointer'
                        }}>
                            ← Anterior
                        </button>
                    )}
                    {currentStep < 3 ? (
                        <button type="button" onClick={() => setCurrentStep(s => s + 1)} style={{
                            flex: 2, padding: '13px', borderRadius: '10px', border: 'none',
                            background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
                            color: 'white', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer'
                        }}>
                            Siguiente →
                        </button>
                    ) : (
                        <button type="submit" onClick={handleSubmit} style={{
                            flex: 2, padding: '13px', borderRadius: '10px', border: 'none',
                            background: 'linear-gradient(135deg, var(--color-success), #059669)',
                            color: 'white', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer'
                        }}>
                            ✓ {rental ? 'Guardar' : 'Crear Renta'}
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // DESKTOP VERSION
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                <div className="modal-header">
                    <h2 className="modal-title">{rental ? 'Editar Renta' : 'Nueva Renta'}</h2>
                    <button onClick={onClose} className="modal-close"><X size={24} /></button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Cliente *</label>
                        <input type="text" name="customerName" value={formData.customerName} onChange={handleChange} className="form-input" placeholder="Nombre" />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Tipo de Cuenta</label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button type="button" onClick={() => setFormData(p => ({ ...p, accountType: 'full' }))} className={`btn ${formData.accountType === 'full' ? 'btn-primary' : 'btn-ghost'}`} style={{ flex: 1 }}>
                                🔑 Completa
                            </button>
                            <button type="button" onClick={() => setFormData(p => ({ ...p, accountType: 'profile' }))} className={`btn ${formData.accountType === 'profile' ? 'btn-secondary' : 'btn-ghost'}`} style={{ flex: 1 }}>
                                👤 Perfil
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">¿Combo o Solo?</label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button type="button" onClick={() => setFormData(p => ({ ...p, isCombo: false }))} className={`btn ${!formData.isCombo ? 'btn-primary' : 'btn-ghost'}`} style={{ flex: 1 }}>
                                1️⃣ Solo
                            </button>
                            <button type="button" onClick={() => setFormData(p => ({ ...p, isCombo: true }))} className={`btn ${formData.isCombo ? 'btn-primary' : 'btn-ghost'}`} style={{ flex: 1 }}>
                                📦 Combo
                            </button>
                        </div>
                    </div>

                    {!formData.isCombo ? (
                        <>
                            <div className="form-group">
                                <label className="form-label">Plataforma *</label>
                                <select name="platform" value={singleAccount.platform} onChange={handleSingleAccountChange} className="form-select">
                                    <option value="">Seleccionar</option>
                                    {allPlatforms.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>
                            <div className="flex gap-md">
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label">Email *</label>
                                    <input type="email" name="accountEmail" value={singleAccount.accountEmail} onChange={handleSingleAccountChange} className="form-input" />
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label">Contraseña *</label>
                                    <input type="text" name="accountPassword" value={singleAccount.accountPassword} onChange={handleSingleAccountChange} className="form-input" />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Precio ({currencySymbol}) *</label>
                                <input type="number" name="price" value={singleAccount.price} onChange={handleSingleAccountChange} className="form-input" min="0" />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="form-group">
                                <label className="form-label">Tipo de Precio</label>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button type="button" onClick={() => setFormData(p => ({ ...p, pricingType: 'total' }))} className={`btn ${formData.pricingType === 'total' ? 'btn-primary' : 'btn-ghost'}`} style={{ flex: 1 }}>
                                        💰 Precio Total
                                    </button>
                                    <button type="button" onClick={() => setFormData(p => ({ ...p, pricingType: 'individual' }))} className={`btn ${formData.pricingType === 'individual' ? 'btn-primary' : 'btn-ghost'}`} style={{ flex: 1 }}>
                                        💵 Por Cuenta
                                    </button>
                                </div>
                            </div>

                            {formData.pricingType === 'total' && (
                                <div className="form-group">
                                    <label className="form-label">Precio Total Combo ({currencySymbol}) *</label>
                                    <input type="number" name="comboPrice" value={formData.comboPrice} onChange={handleChange} className="form-input" min="0" />
                                </div>
                            )}

                            {comboAccounts.map((acc, index) => (
                                <div key={index} className="glass-card" style={{ padding: '1rem', marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <strong>Cuenta {index + 1}</strong>
                                        {comboAccounts.length > 1 && (
                                            <button type="button" onClick={() => removeComboAccount(index)} className="btn btn-ghost btn-sm"><Trash2 size={14} /></button>
                                        )}
                                    </div>
                                    <select value={acc.platform} onChange={(e) => handleComboAccountChange(index, 'platform', e.target.value)} className="form-select" style={{ marginBottom: '0.5rem' }}>
                                        <option value="">Plataforma</option>
                                        {allPlatforms.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                    <div className="flex gap-sm">
                                        <input type="email" value={acc.accountEmail} onChange={(e) => handleComboAccountChange(index, 'accountEmail', e.target.value)} className="form-input" placeholder="Email" style={{ flex: 1 }} />
                                        <input type="text" value={acc.accountPassword} onChange={(e) => handleComboAccountChange(index, 'accountPassword', e.target.value)} className="form-input" placeholder="Pass" style={{ flex: 1 }} />
                                    </div>
                                    {formData.pricingType === 'individual' && (
                                        <input type="number" value={acc.price} onChange={(e) => handleComboAccountChange(index, 'price', e.target.value)} className="form-input" placeholder={`Precio (${currencySymbol})`} min="0" style={{ marginTop: '0.5rem' }} />
                                    )}
                                </div>
                            ))}
                            <button type="button" onClick={addComboAccount} className="btn btn-ghost" style={{ width: '100%' }}>
                                <Plus size={16} /> Agregar Cuenta
                            </button>
                        </>
                    )}

                    <div className="flex gap-md" style={{ marginTop: '1rem' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label">Duración (meses) *</label>
                            <input type="number" name="duration" value={formData.duration} onChange={handleChange} className="form-input" min="1" />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label">Fecha Inicio *</label>
                            <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="form-input" />
                        </div>
                    </div>

                    <div className="flex gap-md" style={{ justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                        <button type="button" onClick={onClose} className="btn btn-ghost">Cancelar</button>
                        <button type="submit" className="btn btn-primary">{rental ? 'Guardar' : 'Crear Renta'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RentalForm;
