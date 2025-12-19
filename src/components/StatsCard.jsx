import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatsCard = ({ title, value, icon: Icon, trend, color = 'primary' }) => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const colorMap = {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        danger: 'var(--color-danger)',
        info: 'var(--color-info)'
    };

    const selectedColor = colorMap[color] || colorMap.primary;

    // MOBILE: Compact horizontal card
    if (isMobile) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 14px',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '12px',
                border: '1px solid var(--glass-border)',
                borderLeft: `3px solid ${selectedColor}`
            }}>
                {/* Icon */}
                <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: `${selectedColor}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                }}>
                    <Icon size={18} color={selectedColor} />
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                        fontSize: '0.7rem',
                        color: 'var(--color-text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.03em',
                        marginBottom: '2px'
                    }}>
                        {title}
                    </div>
                    <div style={{
                        fontSize: '1.4rem',
                        fontWeight: 800,
                        color: selectedColor,
                        lineHeight: 1
                    }}>
                        {value}
                    </div>
                </div>

                {/* Trend */}
                {trend !== undefined && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: trend >= 0 ? 'var(--color-success)' : 'var(--color-danger)',
                        flexShrink: 0
                    }}>
                        {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {Math.abs(trend)}%
                    </div>
                )}
            </div>
        );
    }

    // DESKTOP: Original card style
    return (
        <div className="glass-card animate-slide-up">
            <div className="flex-between" style={{ marginBottom: 'var(--spacing-md)' }}>
                <div style={{
                    padding: 'var(--spacing-md)',
                    borderRadius: 'var(--radius-md)',
                    background: `linear-gradient(135deg, ${selectedColor}33, ${selectedColor}11)`,
                    border: `1px solid ${selectedColor}44`
                }}>
                    <Icon size={24} color={selectedColor} />
                </div>

                {trend !== undefined && (
                    <div className={`flex gap-sm ${trend >= 0 ? 'text-success' : 'text-danger'}`} style={{
                        alignItems: 'center',
                        fontSize: '0.875rem',
                        fontWeight: 600
                    }}>
                        {trend >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                        {Math.abs(trend)}%
                    </div>
                )}
            </div>

            <div>
                <div style={{
                    fontSize: '2rem',
                    fontWeight: 700,
                    color: selectedColor,
                    marginBottom: 'var(--spacing-xs)'
                }}>
                    {value}
                </div>
                <div style={{
                    fontSize: '0.875rem',
                    color: 'var(--color-text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                }}>
                    {title}
                </div>
            </div>
        </div>
    );
};

export default StatsCard;
