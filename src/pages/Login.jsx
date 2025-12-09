import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, LogIn, AlertCircle } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(username, password);

        if (result.success) {
            navigate('/');
        } else {
            setError(result.error);
            setLoading(false);
        }
    };

    return (
        <div className="flex-center" style={{ minHeight: '100vh', padding: 'var(--spacing-md)', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            <div className="glass-card animate-slide-up" style={{
                maxWidth: '420px',
                width: '100%',
                boxShadow: 'var(--shadow-lg), var(--shadow-glow)',
                padding: 'var(--spacing-lg)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-lg)' }}>
                    <div className="flex-center" style={{ marginBottom: 'var(--spacing-sm)' }}>
                        <div style={{
                            padding: 'var(--spacing-md)',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(6, 182, 212, 0.2))',
                            border: '2px solid var(--glass-border)'
                        }}>
                            <Sparkles size={32} color="var(--color-primary-light)" />
                        </div>
                    </div>

                    <h2 style={{ marginBottom: 'var(--spacing-xs)', fontSize: '1.75rem' }}>
                        StreamRent
                    </h2>
                    <p style={{ color: 'var(--color-text-muted)', margin: 0, fontSize: '0.875rem' }}>
                        Sistema de Gestión de Rentas de Streaming
                    </p>
                </div>

                {error && (
                    <div style={{
                        padding: 'var(--spacing-sm)',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: 'var(--spacing-md)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-sm)',
                        color: 'var(--color-danger)'
                    }}>
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Usuario</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="form-input"
                            placeholder="Ingresa tu usuario"
                            required
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="form-input"
                            placeholder="Ingresa tu contraseña"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary flex gap-sm"
                        style={{ width: '100%', justifyContent: 'center', marginTop: 'var(--spacing-xl)' }}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <div className="spinner spinner-small"></div>
                                Iniciando sesión...
                            </>
                        ) : (
                            <>
                                <LogIn size={20} />
                                Iniciar Sesión
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* Telegram Contact Footer - Outside card */}
            <div style={{
                maxWidth: '420px',
                width: '100%',
                padding: 'var(--spacing-sm)',
                background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.06), rgba(6, 182, 212, 0.06))',
                border: '1px solid rgba(168, 85, 247, 0.15)',
                borderRadius: 'var(--radius-md)',
                textAlign: 'center',
                backdropFilter: 'blur(8px)'
            }}>
                <div style={{
                    fontSize: '0.65rem',
                    color: 'var(--color-text-secondary)',
                    marginBottom: '0.5rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    fontWeight: 600
                }}>
                    Soporte, Desarrollos & Ventas
                </div>
                <div style={{
                    display: 'flex',
                    gap: 'var(--spacing-sm)',
                    justifyContent: 'center',
                    flexWrap: 'wrap'
                }}>
                    <a
                        href="https://t.me/StreamRent"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.375rem',
                            padding: '0.375rem 0.875rem',
                            background: 'linear-gradient(135deg, #0088cc, #005f8c)',
                            borderRadius: 'var(--radius-md)',
                            color: 'white',
                            textDecoration: 'none',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            transition: 'all 0.3s ease',
                            boxShadow: '0 2px 8px rgba(0, 136, 204, 0.3)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 136, 204, 0.5)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 136, 204, 0.3)';
                        }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.693-1.653-1.124-2.678-1.8-1.185-.781-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.008-1.252-.241-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.14.122.098.155.23.171.324.016.094.036.308.02.475z" />
                        </svg>
                        @StreamRent
                    </a>
                    <a
                        href="https://t.me/ERRORBOT07"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.375rem',
                            padding: '0.375rem 0.875rem',
                            background: 'linear-gradient(135deg, #0088cc, #005f8c)',
                            borderRadius: 'var(--radius-md)',
                            color: 'white',
                            textDecoration: 'none',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            transition: 'all 0.3s ease',
                            boxShadow: '0 2px 8px rgba(0, 136, 204, 0.3)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 136, 204, 0.5)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 136, 204, 0.3)';
                        }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.693-1.653-1.124-2.678-1.8-1.185-.781-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.008-1.252-.241-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.14.122.098.155.23.171.324.016.094.036.308.02.475z" />
                        </svg>
                        @ERRORBOT07
                    </a>
                </div>
                <div style={{
                    marginTop: '0.5rem',
                    fontSize: '0.65rem',
                    color: 'var(--color-text-muted)'
                }}>
                    Actualizaciones, soporte y ventas
                </div>
            </div>
        </div >
    );
};

export default Login;
