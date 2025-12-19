import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import UserCounter from '../components/UserCounter';
import SubscriptionExpiredModal from '../components/SubscriptionExpiredModal';
import { LogIn, AlertCircle, Eye, EyeOff } from 'lucide-react';

// Custom Logo Component - Minimalist Play/Stream icon
const StreamLogo = ({ size = 48 }) => (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
        </defs>
        {/* Outer circle */}
        <circle cx="24" cy="24" r="22" stroke="url(#logoGradient)" strokeWidth="2.5" fill="none" />
        {/* Play triangle */}
        <path
            d="M19 15L35 24L19 33V15Z"
            fill="url(#logoGradient)"
        />
        {/* Small streaming lines */}
        <path
            d="M38 18C40 20.5 40 27.5 38 30"
            stroke="url(#logoGradient)"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.7"
        />
        <path
            d="M42 14C45 18.5 45 29.5 42 34"
            stroke="url(#logoGradient)"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.4"
        />
    </svg>
);

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showExpiredModal, setShowExpiredModal] = useState(false);
    const [expiredDate, setExpiredDate] = useState(null);

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
            if (result.error === 'subscriptionExpired') {
                setShowExpiredModal(true);
                setExpiredDate(result.expiredDate);
                setError('');
            } else {
                setError(result.error);
            }
            setLoading(false);
        }
    };

    return (
        <>
            {showExpiredModal && (
                <SubscriptionExpiredModal
                    expiredDate={expiredDate}
                    onClose={() => {
                        setShowExpiredModal(false);
                        setExpiredDate(null);
                    }}
                />
            )}
            <UserCounter />

            {/* Full screen container with subtle animated background */}
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
                background: `
                    radial-gradient(ellipse at 20% 20%, rgba(168, 85, 247, 0.08) 0%, transparent 50%),
                    radial-gradient(ellipse at 80% 80%, rgba(6, 182, 212, 0.06) 0%, transparent 50%),
                    var(--bg-gradient)
                `
            }}>
                {/* Login Card */}
                <div style={{
                    width: '100%',
                    maxWidth: '380px',
                    background: 'rgba(10, 5, 20, 0.85)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '20px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '40px 32px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                }}>
                    {/* Logo & Branding */}
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <div style={{ marginBottom: '16px' }}>
                            <StreamLogo size={56} />
                        </div>
                        <h1 style={{
                            margin: 0,
                            fontSize: '1.75rem',
                            fontWeight: 700,
                            letterSpacing: '-0.5px',
                            background: 'linear-gradient(135deg, #fff 0%, rgba(255, 255, 255, 0.7) 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            Streaming Rent
                        </h1>
                        <p style={{
                            margin: '6px 0 0 0',
                            fontSize: '0.8rem',
                            color: 'rgba(255, 255, 255, 0.4)',
                            fontWeight: 400
                        }}>
                            Gestión de cuentas streaming
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div style={{
                            padding: '12px 14px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            borderRadius: '10px',
                            marginBottom: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            fontSize: '0.85rem',
                            color: '#f87171'
                        }}>
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleSubmit}>
                        {/* Username Field */}
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontSize: '0.75rem',
                                fontWeight: 500,
                                color: 'rgba(255, 255, 255, 0.5)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>
                                Usuario
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Ingresa tu usuario"
                                required
                                autoFocus
                                style={{
                                    width: '100%',
                                    padding: '14px 16px',
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    border: '1px solid rgba(255, 255, 255, 0.08)',
                                    borderRadius: '12px',
                                    color: 'white',
                                    fontSize: '0.95rem',
                                    outline: 'none',
                                    transition: 'border-color 0.2s, box-shadow 0.2s'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = 'rgba(168, 85, 247, 0.4)';
                                    e.target.style.boxShadow = '0 0 0 3px rgba(168, 85, 247, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                        </div>

                        {/* Password Field */}
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontSize: '0.75rem',
                                fontWeight: 500,
                                color: 'rgba(255, 255, 255, 0.5)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>
                                Contraseña
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Ingresa tu contraseña"
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '14px 48px 14px 16px',
                                        background: 'rgba(255, 255, 255, 0.03)',
                                        border: '1px solid rgba(255, 255, 255, 0.08)',
                                        borderRadius: '12px',
                                        color: 'white',
                                        fontSize: '0.95rem',
                                        outline: 'none',
                                        transition: 'border-color 0.2s, box-shadow 0.2s'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = 'rgba(168, 85, 247, 0.4)';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(168, 85, 247, 0.1)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '14px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        color: 'rgba(255, 255, 255, 0.3)',
                                        cursor: 'pointer',
                                        padding: '4px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '14px 20px',
                                background: loading
                                    ? 'rgba(168, 85, 247, 0.3)'
                                    : 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
                                border: 'none',
                                borderRadius: '12px',
                                color: 'white',
                                fontSize: '0.95rem',
                                fontWeight: 600,
                                cursor: loading ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                boxShadow: loading ? 'none' : '0 4px 20px rgba(168, 85, 247, 0.3)'
                            }}
                            onMouseEnter={(e) => {
                                if (!loading) {
                                    e.target.style.transform = 'translateY(-1px)';
                                    e.target.style.boxShadow = '0 6px 25px rgba(168, 85, 247, 0.4)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = loading ? 'none' : '0 4px 20px rgba(168, 85, 247, 0.3)';
                            }}
                        >
                            {loading ? (
                                <>
                                    <div style={{
                                        width: '18px',
                                        height: '18px',
                                        border: '2px solid rgba(255, 255, 255, 0.3)',
                                        borderTopColor: 'white',
                                        borderRadius: '50%',
                                        animation: 'spin 1s linear infinite'
                                    }} />
                                    Ingresando...
                                </>
                            ) : (
                                <>
                                    <LogIn size={18} />
                                    Iniciar Sesión
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Contact Footer - Clean and minimal */}
                <div style={{
                    position: 'fixed',
                    bottom: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <span style={{
                        fontSize: '0.65rem',
                        color: 'rgba(255, 255, 255, 0.25)',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                    }}>
                        Soporte & Ventas
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <a
                            href="https://t.me/StreamRent"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                padding: '8px 14px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                borderRadius: '8px',
                                color: 'rgba(255, 255, 255, 0.6)',
                                fontSize: '0.75rem',
                                textDecoration: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                                e.target.style.color = 'white';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                                e.target.style.color = 'rgba(255, 255, 255, 0.6)';
                            }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.442-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.141.121.099.154.232.17.325.015.094.034.31.019.478z" />
                            </svg>
                            @StreamRent
                        </a>
                        <a
                            href="https://t.me/ERRORBOT07"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                padding: '8px 14px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                borderRadius: '8px',
                                color: 'rgba(255, 255, 255, 0.6)',
                                fontSize: '0.75rem',
                                textDecoration: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                                e.target.style.color = 'white';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                                e.target.style.color = 'rgba(255, 255, 255, 0.6)';
                            }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.442-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.141.121.099.154.232.17.325.015.094.034.31.019.478z" />
                            </svg>
                            @ERRORBOT07
                        </a>
                    </div>
                </div>
            </div>

            {/* Keyframes for spinner */}
            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </>
    );
};

export default Login;
