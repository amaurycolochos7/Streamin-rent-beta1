import React, { useState, useEffect } from 'react';

const VersionDisplay = () => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <>
            <div style={{
                position: 'fixed',
                bottom: isMobile ? '12px' : '20px',
                left: isMobile ? '12px' : '20px',
                fontSize: isMobile ? '0.65rem' : '0.75rem',
                fontWeight: 600,
                color: 'rgba(255, 255, 255, 0.4)',
                padding: isMobile ? '4px 8px' : '6px 12px',
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
                V-1.2
            </div>
        </>
    );
};

export default VersionDisplay;
