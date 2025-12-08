import React, { useState } from 'react';
import { Edit2, Trash2, Eye, EyeOff, RotateCcw, Hash } from 'lucide-react';
import ExpirationBadge from './ExpirationBadge';
import { formatDate, formatDateForInput } from '../utils/dateHelpers';
import { useAuth } from '../contexts/AuthContext';

const platformColors = {
    'Netflix': '#E50914',
    'Spotify': '#1DB954',
    'Prime Video': '#00A8E1',
    'HBO Max': '#B100FF',
    'Disney+': '#113CCF',
    'Apple TV+': '#000000',
    'Paramount+': '#0064FF',
    'Crunchyroll': '#F47521',
    'YouTube Premium': '#FF0000',
    'Default': 'var(--color-primary)'
};

const RentalCard = ({ rental, onEdit, onDelete, onAddReplacement }) => {
    const { currentUser } = useAuth();
    const [showCredentials, setShowCredentials] = useState(false);
    const [showReplacements, setShowReplacements] = useState(false);

    const platformColor = platformColors[rental.platform] || platformColors['Default'];
    const currencySymbol = currentUser?.currency || '$';

    return (
        <div className="glass-card animate-slide-up" style={{
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            height: '100%'
        }}>
            {/* Platform color accent */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: platformColor
            }} />

            {/* Rental ID Badge */}
            <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--spacing-xs)',
                padding: '0.25rem 0.75rem',
                background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(6, 182, 212, 0.2))',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                borderRadius: 'var(--radius-md)',
                marginBottom: 'var(--spacing-md)',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--color-primary-light)',
                fontFamily: 'monospace',
                letterSpacing: '0.05em'
            }}>
                <Hash size={14} />
                {rental.rentalId || 'Sin ID'}
            </div>

            <div style={{ marginBottom: 'var(--spacing-md)' }}>
                {/* Platform name - full width */}
                <h3 style={{
                    margin: 0,
                    fontSize: '1.25rem',
                    color: platformColor,
                    marginBottom: 'var(--spacing-xs)'
                }}>
                    {rental.platform}
                </h3>

                {/* Expiration badge - own line */}
                <div style={{ marginBottom: 'var(--spacing-xs)' }}>
                    <ExpirationBadge expirationDate={rental.expirationDate} />
                </div>

                <div style={{
                    color: 'var(--color-text-secondary)',
                    fontSize: '0.875rem',
                    marginBottom: 'var(--spacing-xs)'
                }}>
                    {rental.customerName}
                </div>

                {/* Account Type Badge */}
                <div style={{ marginBottom: 'var(--spacing-sm)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                    <span style={{
                        display: 'inline-block',
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        borderRadius: 'var(--radius-sm)',
                        background: rental.accountType === 'profile' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                        color: rental.accountType === 'profile' ? '#60a5fa' : '#34d399',
                        border: `1px solid ${rental.accountType === 'profile' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
                    }}>
                        {rental.accountType === 'profile' ? '👤 Perfil' : '🔑 Cuenta Completa'}
                    </span>
                    {rental.accountType === 'profile' && rental.profileName && (
                        <span style={{
                            fontSize: '0.75rem',
                            color: 'var(--color-text-muted)',
                            fontStyle: 'italic'
                        }}>
                            • {rental.profileName}
                        </span>
                    )}
                </div>

                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-xs)',
                    padding: '0.375rem 0.875rem',
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.15))',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: 'var(--radius-lg)',
                    fontSize: '1.125rem',
                    fontWeight: 700,
                    color: 'var(--color-success)'
                }}>
                    {currencySymbol}{parseFloat(rental.price).toFixed(2)}
                </div>
            </div>


            <div style={{
                marginBottom: 'var(--spacing-md)',
                padding: 'var(--spacing-md)',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--glass-border)'
            }}>
                <div style={{ marginBottom: 'var(--spacing-sm)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Inicio</span>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{formatDate(rental.startDate)}</span>
                </div>
                <div style={{ marginBottom: 'var(--spacing-sm)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vence</span>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{formatDate(rental.expirationDate)}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Duración</span>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{rental.duration} mes{rental.duration !== 1 ? 'es' : ''}</span>
                </div>
            </div>

            <div style={{ marginBottom: 'var(--spacing-md)', marginTop: 'auto' }}>
                <button
                    onClick={() => setShowCredentials(!showCredentials)}
                    className="btn btn-ghost btn-sm flex gap-sm"
                    style={{ width: '100%', justifyContent: 'center' }}
                >
                    {showCredentials ? <EyeOff size={16} /> : <Eye size={16} />}
                    {showCredentials ? 'Ocultar' : 'Ver'} Credenciales
                </button>

                {showCredentials && (
                    <div style={{
                        marginTop: 'var(--spacing-md)',
                        padding: 'var(--spacing-md)',
                        background: 'rgba(0, 0, 0, 0.3)',
                        borderRadius: 'var(--radius-md)',
                        fontFamily: 'monospace',
                        fontSize: '0.875rem'
                    }}>
                        <div style={{ marginBottom: 'var(--spacing-sm)' }}>
                            <span style={{ color: 'var(--color-text-muted)' }}>Email: </span>
                            <span style={{ color: 'var(--color-secondary-light)' }}>{rental.accountEmail}</span>
                        </div>
                        <div>
                            <span style={{ color: 'var(--color-text-muted)' }}>Password: </span>
                            <span style={{ color: 'var(--color-secondary-light)' }}>{rental.accountPassword}</span>
                        </div>
                    </div>
                )}
            </div>

            {rental.replacements && rental.replacements.length > 0 && (
                <div style={{ marginBottom: 'var(--spacing-md)' }}>
                    <button
                        onClick={() => setShowReplacements(!showReplacements)}
                        className="btn btn-ghost btn-sm flex gap-sm"
                        style={{ width: '100%', justifyContent: 'center' }}
                    >
                        <RotateCcw size={16} />
                        Reposiciones ({rental.replacements.length})
                    </button>

                    {showReplacements && (
                        <div style={{ marginTop: 'var(--spacing-md)' }}>
                            {rental.replacements.map((rep, index) => (
                                <div
                                    key={index}
                                    style={{
                                        padding: 'var(--spacing-sm)',
                                        background: 'rgba(255, 255, 255, 0.03)',
                                        borderRadius: 'var(--radius-sm)',
                                        marginBottom: 'var(--spacing-sm)',
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    <div style={{ color: 'var(--color-text-muted)' }}>
                                        {formatDate(rep.date)}
                                    </div>
                                    <div>{rep.reason}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {rental.notes && (
                <div style={{
                    padding: 'var(--spacing-md)',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: 'var(--spacing-md)',
                    fontSize: '0.875rem',
                    fontStyle: 'italic',
                    color: 'var(--color-text-secondary)'
                }}>
                    {rental.notes}
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                {/* Show Renovar button for expired rentals */}
                {(() => {
                    const now = new Date();
                    const expirationDate = new Date(rental.expirationDate);
                    const isExpired = expirationDate < now;

                    if (isExpired) {
                        return (
                            <button
                                onClick={() => onEdit(rental)}
                                className="btn btn-primary btn-sm flex gap-sm"
                                style={{ width: '100%', justifyContent: 'center' }}
                            >
                                <RotateCcw size={16} />
                                Renovar Suscripción
                            </button>
                        );
                    }
                    return null;
                })()}

                <button
                    onClick={() => onAddReplacement(rental)}
                    className="btn btn-secondary btn-sm flex gap-sm"
                    style={{ width: '100%', justifyContent: 'center' }}
                >
                    <RotateCcw size={16} />
                    Reposición
                </button>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-sm)' }}>
                    <button
                        onClick={() => onEdit(rental)}
                        className="btn btn-ghost btn-sm flex gap-sm"
                        style={{ justifyContent: 'center' }}
                    >
                        <Edit2 size={16} />
                        Editar
                    </button>
                    <button
                        onClick={() => onDelete(rental.id)}
                        className="btn btn-danger btn-sm flex gap-sm"
                        style={{ justifyContent: 'center' }}
                    >
                        <Trash2 size={16} />
                        Eliminar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RentalCard;
