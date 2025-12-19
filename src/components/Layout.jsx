import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';

const Layout = ({ children }) => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <main className="container animate-fade-in" style={{
                flex: 1,
                paddingTop: isMobile ? 'var(--spacing-md)' : 'var(--spacing-xl)',
                paddingBottom: isMobile ? 'var(--spacing-lg)' : 'var(--spacing-xl)',
                paddingLeft: isMobile ? 'var(--spacing-sm)' : 'var(--spacing-lg)',
                paddingRight: isMobile ? 'var(--spacing-sm)' : 'var(--spacing-lg)'
            }}>
                {children}
            </main>
        </div>
    );
};

export default Layout;
