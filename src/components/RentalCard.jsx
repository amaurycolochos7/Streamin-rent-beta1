import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, Eye, EyeOff, RotateCcw, Hash, ChevronDown, ChevronUp } from 'lucide-react';
import ExpirationBadge from './ExpirationBadge';
import { formatDate } from '../utils/dateHelpers';
import { useAuth } from '../contexts/AuthContext';

const platformColors = {
    'Netflix': '#E50914',
    'Spotify': '#1DB954',
    'Prime Video': '#00A8E1',
    'HBO Max': '#B100FF',
    'Disney+': '#113CCF',
    'Apple TV+': '#555555',
    'Paramount+': '#0064FF',
    'Crunchyroll': '#F47521',
    'YouTube Premium': '#FF0000',
    'Default': 'var(--color-primary)'
};

// Calculate days remaining
const getDaysRemaining = (expirationDate) => {
    const now = new Date();
    const exp = new Date(expirationDate);
    const diff = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
    return diff;
};

const RentalCard = ({ rental, onEdit, onDelete, onAddReplacement }) => {
    const { currentUser } = useAuth();
    const [showCredentials, setShowCredentials] = useState(false);
    const [showReplacements, setShowReplacements] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const platformColor = platformColors[rental.platform] || platformColors['Default'];
    const currencySymbol = currentUser?.currency || '$';
    const daysRemaining = getDaysRemaining(rental.expirationDate);

    // MOBILE: Ultra-compact list item style
    if (isMobile) {
        return (
            <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '10px',
                border: '1px solid var(--glass-border)',
                overflow: 'hidden',
                marginBottom: '8px'
            }}>
                {/* Main Row - Clickable to expand */}
                <div
                    onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '12px',
                        cursor: 'pointer',
                        gap: '10px',
                        borderLeft: `4px solid ${platformColor}`
                    }}
                >
                    {/* Platform Icon/Initial */}
                    <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        background: `${platformColor}20`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.9rem',
                        fontWeight: 800,
                        color: platformColor,
                        flexShrink: 0
                    }}>
                        {rental.platform.charAt(0)}
                    </div>

                    {/* Main Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                            fontWeight: 600,
                            fontSize: '0.85rem',
                            color: 'var(--color-text-primary)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>
                            {rental.platform}
                        </div>
                        <div style={{
                            fontSize: '0.75rem',
                            color: 'var(--color-text-muted)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>
                            {rental.customerName}
                        </div>
                    </div>

                    {/* Days Badge */}
                    <div style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        background: daysRemaining <= 0 ? 'rgba(239, 68, 68, 0.2)' :
                            daysRemaining <= 7 ? 'rgba(245, 158, 11, 0.2)' :
                                'rgba(16, 185, 129, 0.2)',
                        color: daysRemaining <= 0 ? '#f87171' :
                            daysRemaining <= 7 ? '#fbbf24' :
                                '#34d399',
                        border: `1px solid ${daysRemaining <= 0 ? 'rgba(239, 68, 68, 0.3)' :
                            daysRemaining <= 7 ? 'rgba(245, 158, 11, 0.3)' :
                                'rgba(16, 185, 129, 0.3)'}`,
                        flexShrink: 0
                    }}>
                        {daysRemaining <= 0 ? 'Vencido' : `${daysRemaining}d`}
                    </div>

                    {/* Expand Arrow */}
                    <div style={{ color: 'var(--color-text-muted)', flexShrink: 0 }}>
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                    <div style={{
                        padding: '12px',
                        paddingTop: '0',
                        borderTop: '1px solid var(--glass-border)',
                        background: 'rgba(0, 0, 0, 0.2)'
                    }}>
                        {/* Quick Info Row */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '10px',
                            paddingTop: '10px'
                        }}>
                            <span style={{
                                fontSize: '0.65rem',
                                padding: '2px 6px',
                                background: 'rgba(168, 85, 247, 0.2)',
                                borderRadius: '4px',
                                color: 'var(--color-primary-light)',
                                fontFamily: 'monospace'
                            }}>
                                #{rental.rentalId || 'N/A'}
                            </span>
                            <span style={{
                                fontSize: '0.9rem',
                                fontWeight: 700,
                                color: 'var(--color-success)'
                            }}>
                                {currencySymbol}{parseFloat(rental.price).toFixed(0)}
                            </span>
                        </div>

                        {/* Dates Grid */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '8px',
                            marginBottom: '10px',
                            fontSize: '0.7rem'
                        }}>
                            <div style={{
                                padding: '6px 8px',
                                background: 'rgba(255, 255, 255, 0.03)',
                                borderRadius: '6px'
                            }}>
                                <div style={{ color: 'var(--color-text-muted)', marginBottom: '2px' }}>Inicio</div>
                                <div style={{ fontWeight: 600 }}>{formatDate(rental.startDate)}</div>
                            </div>
                            <div style={{
                                padding: '6px 8px',
                                background: 'rgba(255, 255, 255, 0.03)',
                                borderRadius: '6px'
                            }}>
                                <div style={{ color: 'var(--color-text-muted)', marginBottom: '2px' }}>Vence</div>
                                <div style={{ fontWeight: 600 }}>{formatDate(rental.expirationDate)}</div>
                            </div>
                        </div>

                        {/* Credentials Toggle */}
                        <button
                            onClick={(e) => { e.stopPropagation(); setShowCredentials(!showCredentials); }}
                            style={{
                                width: '100%',
                                padding: '8px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '6px',
                                color: 'var(--color-text-secondary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                                marginBottom: '8px'
                            }}
                        >
                            {showCredentials ? <EyeOff size={14} /> : <Eye size={14} />}
                            {showCredentials ? 'Ocultar' : 'Ver'} Credenciales
                        </button>

                        {showCredentials && (
                            <div style={{
                                padding: '8px',
                                background: 'rgba(0, 0, 0, 0.3)',
                                borderRadius: '6px',
                                marginBottom: '8px'
                            }}>
                                {/* Check if it's a combo with multiple accounts */}
                                {rental.isCombo && rental.accounts && rental.accounts.length > 0 ? (
                                    rental.accounts.map((acc, index) => (
                                        <div key={index} style={{
                                            padding: '8px',
                                            background: 'rgba(255, 255, 255, 0.03)',
                                            borderRadius: '6px',
                                            marginBottom: index < rental.accounts.length - 1 ? '8px' : 0,
                                            border: '1px solid var(--glass-border)'
                                        }}>
                                            <div style={{
                                                fontSize: '0.7rem',
                                                fontWeight: 600,
                                                color: platformColors[acc.platform] || 'var(--color-primary-light)',
                                                marginBottom: '6px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '6px'
                                            }}>
                                                <span style={{
                                                    width: '20px',
                                                    height: '20px',
                                                    borderRadius: '4px',
                                                    background: `${platformColors[acc.platform] || platformColors['Default']}20`,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '0.6rem'
                                                }}>
                                                    {acc.platform?.charAt(0)}
                                                </span>
                                                {acc.platform}
                                                {acc.profileName && <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>({acc.profileName})</span>}
                                            </div>
                                            <div style={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>
                                                <div style={{ marginBottom: '2px' }}>
                                                    <span style={{ color: 'var(--color-text-muted)' }}>📧 </span>
                                                    <span style={{ color: 'var(--color-secondary-light)' }}>{acc.accountEmail}</span>
                                                </div>
                                                <div>
                                                    <span style={{ color: 'var(--color-text-muted)' }}>🔑 </span>
                                                    <span style={{ color: 'var(--color-secondary-light)' }}>{acc.accountPassword}</span>
                                                </div>
                                                {acc.price && (
                                                    <div style={{ marginTop: '4px' }}>
                                                        <span style={{ color: 'var(--color-text-muted)' }}>💰 </span>
                                                        <span style={{ color: 'var(--color-success)' }}>{currencySymbol}{acc.price}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    /* Single account (non-combo) */
                                    <div style={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>
                                        <div style={{ marginBottom: '4px' }}>
                                            <span style={{ color: 'var(--color-text-muted)' }}>📧 </span>
                                            <span style={{ color: 'var(--color-secondary-light)' }}>{rental.accountEmail}</span>
                                        </div>
                                        <div>
                                            <span style={{ color: 'var(--color-text-muted)' }}>🔑 </span>
                                            <span style={{ color: 'var(--color-secondary-light)' }}>{rental.accountPassword}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Action Buttons - Horizontal */}
                        <div style={{
                            display: 'flex',
                            gap: '6px'
                        }}>
                            <button
                                onClick={(e) => { e.stopPropagation(); onAddReplacement(rental); }}
                                style={{
                                    flex: 1,
                                    padding: '10px 8px',
                                    background: 'rgba(6, 182, 212, 0.15)',
                                    border: '1px solid rgba(6, 182, 212, 0.3)',
                                    borderRadius: '6px',
                                    color: 'var(--color-secondary-light)',
                                    fontSize: '0.7rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '4px'
                                }}
                            >
                                <RotateCcw size={12} /> Repo
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); onEdit(rental); }}
                                style={{
                                    flex: 1,
                                    padding: '10px 8px',
                                    background: 'rgba(168, 85, 247, 0.15)',
                                    border: '1px solid rgba(168, 85, 247, 0.3)',
                                    borderRadius: '6px',
                                    color: 'var(--color-primary-light)',
                                    fontSize: '0.7rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '4px'
                                }}
                            >
                                <Edit2 size={12} /> Editar
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); onDelete(rental.id); }}
                                style={{
                                    flex: 1,
                                    padding: '10px 8px',
                                    background: 'rgba(239, 68, 68, 0.15)',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    borderRadius: '6px',
                                    color: 'var(--color-danger)',
                                    fontSize: '0.7rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '4px'
                                }}
                            >
                                <Trash2 size={12} /> Borrar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // DESKTOP VERSION (unchanged - full card view)
    return (
        <div className="glass-card animate-slide-up" style={{
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            height: '100%'
        }}>
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: platformColor
            }} />

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
                <h3 style={{
                    margin: 0,
                    fontSize: '1.25rem',
                    color: platformColor,
                    marginBottom: 'var(--spacing-xs)'
                }}>
                    {rental.platform}
                </h3>

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

                <div style={{ marginBottom: 'var(--spacing-sm)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                    <span style={{
                        display: 'inline-block',
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        borderRadius: 'var(--radius-sm)',
                        background: rental.accountType === 'profile' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                        color: rental.accountType === 'profile' ? '#60a5fa' : '#34d399',
                        border: `1px solid ${rental.accountType === 'profile' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
                    }}>
                        {rental.accountType === 'profile' ? '👤 Perfil' : '🔑 Cuenta Completa'}
                    </span>
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
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Inicio</span>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{formatDate(rental.startDate)}</span>
                </div>
                <div style={{ marginBottom: 'var(--spacing-sm)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Vence</span>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{formatDate(rental.expirationDate)}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Duración</span>
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
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
