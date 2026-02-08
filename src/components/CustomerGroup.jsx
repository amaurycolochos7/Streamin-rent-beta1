import React, { useState } from 'react';
import { ChevronDown, ChevronUp, User, Eye, EyeOff, Edit2, Trash2, RotateCcw } from 'lucide-react';
import { formatDate } from '../utils/dateHelpers';

// Platform colors for visual distinction
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

const getDaysRemaining = (expirationDate) => {
    const now = new Date();
    const exp = new Date(expirationDate);
    return Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
};

// Component to display rentals grouped by customer (combo view)
const CustomerGroup = ({ customerName, rentals, onEdit, onDelete, onAddReplacement, currencySymbol = '$' }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showCredentials, setShowCredentials] = useState(false);

    // Calculate total price
    const totalPrice = rentals.reduce((sum, r) => sum + parseFloat(r.price || 0), 0);

    // Get ALL individual platforms (including those inside combos)
    const allPlatforms = [];
    const allAccounts = [];

    rentals.forEach(rental => {
        if (rental.isCombo && rental.accounts && rental.accounts.length > 0) {
            // For combo rentals, add each account's platform
            rental.accounts.forEach(acc => {
                allPlatforms.push(acc.platform);
                allAccounts.push({
                    ...acc,
                    rentalId: rental.id,
                    expirationDate: rental.expirationDate,
                    startDate: rental.startDate
                });
            });
        } else {
            // For single rentals
            allPlatforms.push(rental.platform);
            allAccounts.push({
                platform: rental.platform,
                accountEmail: rental.accountEmail,
                accountPassword: rental.accountPassword,
                profileName: rental.profileName,
                price: rental.price,
                rentalId: rental.id,
                expirationDate: rental.expirationDate,
                startDate: rental.startDate
            });
        }
    });

    // Count total accounts (combo accounts + single accounts)
    const totalAccounts = allAccounts.length;

    // Find earliest expiration
    const earliestExpiration = rentals.reduce((earliest, r) => {
        const date = new Date(r.expirationDate);
        return date < earliest ? date : earliest;
    }, new Date(rentals[0].expirationDate));

    const daysUntilExpiration = getDaysRemaining(earliestExpiration);

    return (
        <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '12px',
            border: '1px solid var(--glass-border)',
            overflow: 'hidden',
            marginBottom: '10px'
        }}>
            {/* Header - Always visible */}
            <div
                onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '14px 12px',
                    cursor: 'pointer',
                    gap: '10px',
                    background: isExpanded ? 'rgba(168, 85, 247, 0.05)' : 'transparent',
                    borderBottom: isExpanded ? '1px solid var(--glass-border)' : 'none'
                }}
            >
                {/* Avatar */}
                <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(6, 182, 212, 0.2))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    border: '1px solid rgba(168, 85, 247, 0.3)'
                }}>
                    <User size={18} color="var(--color-primary-light)" />
                </div>

                {/* Customer Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        color: 'var(--color-text-primary)',
                        marginBottom: '2px'
                    }}>
                        {customerName}
                    </div>
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '4px'
                    }}>
                        {/* Show individual platforms, not combined ones */}
                        {allPlatforms.map((platform, idx) => (
                            <span
                                key={idx}
                                style={{
                                    fontSize: '0.6rem',
                                    padding: '2px 5px',
                                    borderRadius: '4px',
                                    background: `${platformColors[platform] || platformColors['Default']}20`,
                                    color: platformColors[platform] || platformColors['Default'],
                                    border: `1px solid ${platformColors[platform] || platformColors['Default']}40`
                                }}
                            >
                                {platform}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Price & Count */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{
                        fontSize: '1rem',
                        fontWeight: 700,
                        color: 'var(--color-success)',
                        marginBottom: '2px'
                    }}>
                        {currencySymbol}{totalPrice.toFixed(0)}
                    </div>
                    <div style={{
                        fontSize: '0.7rem',
                        color: 'var(--color-text-muted)'
                    }}>
                        {totalAccounts} cuenta{totalAccounts > 1 ? 's' : ''}
                    </div>
                </div>

                {/* Expiration Badge */}
                <div style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    background: daysUntilExpiration <= 0 ? 'rgba(239, 68, 68, 0.2)' :
                        daysUntilExpiration <= 7 ? 'rgba(245, 158, 11, 0.2)' :
                            'rgba(16, 185, 129, 0.2)',
                    color: daysUntilExpiration <= 0 ? '#f87171' :
                        daysUntilExpiration <= 7 ? '#fbbf24' :
                            '#34d399',
                    flexShrink: 0
                }}>
                    {daysUntilExpiration <= 0 ? 'Venc' : `${daysUntilExpiration}d`}
                </div>

                {/* Expand Arrow */}
                <div style={{ color: 'var(--color-text-muted)', flexShrink: 0 }}>
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
            </div>

            {/* Expanded Content - Show ALL accounts */}
            {isExpanded && (
                <div style={{ padding: '10px' }}>
                    {/* Credentials Toggle */}
                    <button
                        onClick={(e) => { e.stopPropagation(); setShowCredentials(!showCredentials); }}
                        style={{
                            width: '100%',
                            padding: '10px',
                            background: showCredentials ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '8px',
                            color: showCredentials ? 'var(--color-secondary-light)' : 'var(--color-text-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            marginBottom: '10px'
                        }}
                    >
                        {showCredentials ? <EyeOff size={16} /> : <Eye size={16} />}
                        {showCredentials ? 'Ocultar Credenciales' : 'Ver Todas las Credenciales'}
                    </button>

                    {/* Show all accounts with credentials */}
                    {showCredentials && (
                        <div style={{ marginBottom: '10px' }}>
                            {allAccounts.map((acc, index) => {
                                const platformColor = platformColors[acc.platform] || platformColors['Default'];
                                return (
                                    <div key={index} style={{
                                        padding: '12px',
                                        background: 'rgba(0, 0, 0, 0.2)',
                                        borderRadius: '10px',
                                        marginBottom: index < allAccounts.length - 1 ? '8px' : 0,
                                        borderLeft: `4px solid ${platformColor}`
                                    }}>
                                        {/* Platform Header */}
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: '8px'
                                        }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}>
                                                <div style={{
                                                    width: '28px',
                                                    height: '28px',
                                                    borderRadius: '6px',
                                                    background: `${platformColor}20`,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '0.8rem',
                                                    fontWeight: 700,
                                                    color: platformColor
                                                }}>
                                                    {acc.platform?.charAt(0)}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: platformColor }}>
                                                        {acc.platform}
                                                    </div>
                                                    {acc.profileName && (
                                                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                                                            Perfil: {acc.profileName}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {acc.price && (
                                                <span style={{
                                                    fontSize: '0.8rem',
                                                    fontWeight: 600,
                                                    color: 'var(--color-success)'
                                                }}>
                                                    {currencySymbol}{acc.price}
                                                </span>
                                            )}
                                        </div>

                                        {/* Credentials */}
                                        <div style={{
                                            fontFamily: 'monospace',
                                            fontSize: '0.75rem',
                                            background: 'rgba(0, 0, 0, 0.3)',
                                            padding: '8px',
                                            borderRadius: '6px'
                                        }}>
                                            <div style={{ marginBottom: '4px' }}>
                                                <span style={{ color: 'var(--color-text-muted)' }}>📧 </span>
                                                <span style={{ color: 'var(--color-secondary-light)' }}>{acc.accountEmail}</span>
                                            </div>
                                            <div>
                                                <span style={{ color: 'var(--color-text-muted)' }}>🔑 </span>
                                                <span style={{ color: 'var(--color-secondary-light)' }}>{acc.accountPassword}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Quick dates info */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '8px',
                        marginBottom: '10px',
                        fontSize: '0.7rem'
                    }}>
                        <div style={{
                            padding: '8px',
                            background: 'rgba(255, 255, 255, 0.03)',
                            borderRadius: '6px'
                        }}>
                            <div style={{ color: 'var(--color-text-muted)', marginBottom: '2px' }}>Inicio</div>
                            <div style={{ fontWeight: 600 }}>{formatDate(rentals[0].startDate)}</div>
                        </div>
                        <div style={{
                            padding: '8px',
                            background: 'rgba(255, 255, 255, 0.03)',
                            borderRadius: '6px'
                        }}>
                            <div style={{ color: 'var(--color-text-muted)', marginBottom: '2px' }}>Vence</div>
                            <div style={{ fontWeight: 600 }}>{formatDate(rentals[0].expirationDate)}</div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                            onClick={(e) => { e.stopPropagation(); onAddReplacement(rentals[0]); }}
                            style={{
                                flex: 1,
                                padding: '10px',
                                background: 'rgba(6, 182, 212, 0.15)',
                                border: '1px solid rgba(6, 182, 212, 0.3)',
                                borderRadius: '8px',
                                color: 'var(--color-secondary-light)',
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '4px'
                            }}
                        >
                            <RotateCcw size={14} /> Reposición
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onEdit(rentals[0]); }}
                            style={{
                                flex: 1,
                                padding: '10px',
                                background: 'rgba(168, 85, 247, 0.15)',
                                border: '1px solid rgba(168, 85, 247, 0.3)',
                                borderRadius: '8px',
                                color: 'var(--color-primary-light)',
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '4px'
                            }}
                        >
                            <Edit2 size={14} /> Editar
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(rentals[0].id); }}
                            style={{
                                flex: 1,
                                padding: '10px',
                                background: 'rgba(239, 68, 68, 0.15)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                borderRadius: '8px',
                                color: '#f87171',
                                fontSize: '0.75rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '4px'
                            }}
                        >
                            <Trash2 size={14} /> Borrar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerGroup;
