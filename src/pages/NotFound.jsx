import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className="flex-center" style={{ minHeight: '100vh', padding: 'var(--spacing-lg)' }}>
            <div className="text-center">
                <div style={{
                    fontSize: '8rem',
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-secondary-light))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: 'var(--spacing-lg)'
                }}>
                    404
                </div>
                <h1>Página No Encontrada</h1>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-xl)' }}>
                    La página que buscas no existe
                </p>
                <Link to="/" className="btn btn-primary">
                    Volver al Inicio
                </Link>
            </div>
        </div>
    );
};

export default NotFound;
