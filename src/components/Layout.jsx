import React from 'react';
import Navbar from './Navbar';

const Layout = ({ children }) => {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <main className="container animate-fade-in" style={{
                flex: 1,
                paddingTop: 'var(--spacing-xl)',
                paddingBottom: 'var(--spacing-xl)'
            }}>
                {children}
            </main>
        </div>
    );
};

export default Layout;
