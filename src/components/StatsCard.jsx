import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatsCard = ({ title, value, icon: Icon, trend, color = 'primary' }) => {
    const colorMap = {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        danger: 'var(--color-danger)',
        info: 'var(--color-info)'
    };

    const selectedColor = colorMap[color] || colorMap.primary;

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
