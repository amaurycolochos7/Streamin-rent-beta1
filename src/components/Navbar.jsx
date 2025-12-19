import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, LayoutDashboard, Receipt, Users, Sparkles, Menu, X, Home } from 'lucide-react';

const Navbar = () => {
    const { currentUser, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;
    const closeMenu = () => setIsMenuOpen(false);

    // MOBILE: Bottom navigation bar
    if (isMobile) {
        return (
            <>
                {/* Floating Menu Button - Only when menu is closed */}
                {!isMenuOpen && (
                    <button
                        onClick={() => setIsMenuOpen(true)}
                        style={{
                            position: 'fixed',
                            bottom: '20px',
                            right: '20px',
                            width: '50px',
                            height: '50px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
                            border: 'none',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            boxShadow: '0 4px 20px rgba(168, 85, 247, 0.4)',
                            zIndex: 1000
                        }}
                    >
                        <Menu size={24} />
                    </button>
                )}

                {/* Full Screen Menu Overlay */}
                {isMenuOpen && (
                    <div style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(10, 1, 24, 0.95)',
                        backdropFilter: 'blur(20px)',
                        zIndex: 1001,
                        display: 'flex',
                        flexDirection: 'column',
                        padding: '20px'
                    }}>
                        {/* Header */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '30px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Sparkles size={24} color="var(--color-primary-light)" />
                                <span style={{
                                    fontSize: '1.2rem',
                                    fontWeight: 700,
                                    background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-secondary-light))',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent'
                                }}>StreamRent</span>
                            </div>
                            <button
                                onClick={closeMenu}
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '10px',
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    border: 'none',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer'
                                }}
                            >
                                <X size={22} />
                            </button>
                        </div>

                        {/* User Info */}
                        <div style={{
                            padding: '16px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '12px',
                            marginBottom: '20px'
                        }}>
                            <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '4px' }}>
                                {currentUser?.username}
                            </div>
                            <div style={{
                                display: 'inline-block',
                                padding: '4px 10px',
                                background: 'rgba(168, 85, 247, 0.2)',
                                borderRadius: '6px',
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                color: 'var(--color-primary-light)',
                                textTransform: 'uppercase'
                            }}>
                                {currentUser?.role}
                            </div>
                        </div>

                        {/* Navigation Links */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                            <Link
                                to="/"
                                onClick={closeMenu}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '16px',
                                    borderRadius: '12px',
                                    background: isActive('/') ? 'rgba(168, 85, 247, 0.15)' : 'transparent',
                                    border: isActive('/') ? '1px solid rgba(168, 85, 247, 0.3)' : '1px solid transparent',
                                    color: 'var(--color-text-primary)',
                                    textDecoration: 'none',
                                    fontSize: '1rem',
                                    fontWeight: 500
                                }}
                            >
                                <LayoutDashboard size={22} />
                                Dashboard
                            </Link>

                            <Link
                                to="/rentals"
                                onClick={closeMenu}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '16px',
                                    borderRadius: '12px',
                                    background: isActive('/rentals') ? 'rgba(168, 85, 247, 0.15)' : 'transparent',
                                    border: isActive('/rentals') ? '1px solid rgba(168, 85, 247, 0.3)' : '1px solid transparent',
                                    color: 'var(--color-text-primary)',
                                    textDecoration: 'none',
                                    fontSize: '1rem',
                                    fontWeight: 500
                                }}
                            >
                                <Receipt size={22} />
                                Rentas
                            </Link>

                            {currentUser?.role === 'admin' && (
                                <Link
                                    to="/users"
                                    onClick={closeMenu}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '16px',
                                        borderRadius: '12px',
                                        background: isActive('/users') ? 'rgba(168, 85, 247, 0.15)' : 'transparent',
                                        border: isActive('/users') ? '1px solid rgba(168, 85, 247, 0.3)' : '1px solid transparent',
                                        color: 'var(--color-text-primary)',
                                        textDecoration: 'none',
                                        fontSize: '1rem',
                                        fontWeight: 500
                                    }}
                                >
                                    <Users size={22} />
                                    Usuarios
                                </Link>
                            )}
                        </div>

                        {/* Logout Button */}
                        <button
                            onClick={() => { handleLogout(); closeMenu(); }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                padding: '16px',
                                borderRadius: '12px',
                                background: 'rgba(239, 68, 68, 0.15)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                color: 'var(--color-danger)',
                                fontSize: '1rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                marginTop: 'auto'
                            }}
                        >
                            <LogOut size={20} />
                            Cerrar Sesión
                        </button>
                    </div>
                )}
            </>
        );
    }

    // DESKTOP: Original top navbar
    return (
        <nav
            className="glass-card"
            style={{
                margin: 'var(--spacing-md)',
                marginBottom: 0,
                position: 'sticky',
                top: 'var(--spacing-md)',
                zIndex: 100
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div className="flex gap-sm" style={{ alignItems: 'center' }}>
                    <Sparkles size={24} color="var(--color-primary-light)" />
                    <h3 style={{
                        margin: 0,
                        background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-secondary-light))',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontSize: '1.1rem'
                    }}>
                        StreamRent
                    </h3>
                </div>

                <div style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'center' }}>
                    <Link
                        to="/"
                        className={`flex gap-sm btn btn-ghost btn-sm ${isActive('/') ? 'active' : ''}`}
                        style={isActive('/') ? { background: 'var(--glass-bg)', borderColor: 'var(--color-primary)' } : {}}
                    >
                        <LayoutDashboard size={18} />
                        <span>Dashboard</span>
                    </Link>

                    <Link
                        to="/rentals"
                        className={`flex gap-sm btn btn-ghost btn-sm ${isActive('/rentals') ? 'active' : ''}`}
                        style={isActive('/rentals') ? { background: 'var(--glass-bg)', borderColor: 'var(--color-primary)' } : {}}
                    >
                        <Receipt size={18} />
                        <span>Rentas</span>
                    </Link>

                    {currentUser?.role === 'admin' && (
                        <Link
                            to="/users"
                            className={`flex gap-sm btn btn-ghost btn-sm ${isActive('/users') ? 'active' : ''}`}
                            style={isActive('/users') ? { background: 'var(--glass-bg)', borderColor: 'var(--color-primary)' } : {}}
                        >
                            <Users size={18} />
                            <span>Usuarios</span>
                        </Link>
                    )}

                    <div style={{
                        height: '30px',
                        width: '1px',
                        background: 'var(--glass-border)',
                        margin: '0 var(--spacing-sm)'
                    }}></div>

                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: '0.9rem' }}>
                            {currentUser?.username}
                        </div>
                        <div className="badge badge-primary" style={{ fontSize: '0.65rem' }}>
                            {currentUser?.role}
                        </div>
                    </div>

                    <button onClick={handleLogout} className="btn btn-ghost btn-sm flex gap-sm">
                        <LogOut size={18} />
                        <span>Salir</span>
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
