import React from 'react';

const VersionDisplay = () => {
    return (
        <>
            <div style={{
                position: 'fixed',
                bottom: '20px',
                left: '20px',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'rgba(255, 255, 255, 0.4)',
                padding: '6px 12px',
                background: 'rgba(0, 0, 0, 0.2)',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                zIndex: 1000,
                letterSpacing: '0.1em',
                transition: 'all 0.3s ease',
                cursor: 'default'
            }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'rgba(168, 85, 247, 0.9)';
                    e.currentTarget.style.borderColor = 'rgba(168, 85, 247, 0.5)';
                    e.currentTarget.style.background = 'rgba(168, 85, 247, 0.1)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.4)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.background = 'rgba(0, 0, 0, 0.2)';
                }}>
                V-1.0
            </div>
        </>
    );
};

export default VersionDisplay;
