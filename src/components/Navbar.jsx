import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, LayoutDashboard, Receipt, Users, Sparkles, Menu, X } from 'lucide-react';

const Navbar = () => {
    const { currentUser, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;

            // Show navbar ONLY when at the very top (scrollY = 0)
            // Hide navbar when scrolling down at all
            if (scrollY === 0) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
                setIsMenuOpen(false); // Close mobile menu when hiding
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    const closeMenu = () => setIsMenuOpen(false);

    return (
        <nav
            className="glass-card"
            style={{
                margin: 'var(--spacing-md)',
                marginBottom: 0,
                position: 'sticky',
                top: 'var(--spacing-md)',
                zIndex: 100,
                transform: isVisible ? 'translateY(0)' : 'translateY(-120%)',
                opacity: isVisible ? 1 : 0,
                transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease',
                pointerEvents: isVisible ? 'auto' : 'none'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {/* Logo */}
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

                {/* Desktop Navigation */}
                <div className="desktop-nav" style={{
                    display: 'flex',
                    gap: 'var(--spacing-md)',
                    alignItems: 'center'
                }}>
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

                {/* Mobile Menu Button */}
                <button
                    className="mobile-menu-btn btn btn-ghost btn-sm"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    style={{ display: 'none' }}
                >
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="mobile-menu" style={{
                    display: 'none',
                    marginTop: 'var(--spacing-md)',
                    paddingTop: 'var(--spacing-md)',
                    borderTop: '1px solid var(--glass-border)'
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                        {/* User Info */}
                        <div style={{
                            padding: 'var(--spacing-sm)',
                            background: 'var(--glass-bg)',
                            borderRadius: 'var(--radius-md)',
                            marginBottom: 'var(--spacing-sm)'
                        }}>
                            <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                                {currentUser?.username}
                            </div>
                            <div className="badge badge-primary" style={{ fontSize: '0.65rem', marginTop: '4px' }}>
                                {currentUser?.role}
                            </div>
                        </div>

                        <Link
                            to="/"
                            onClick={closeMenu}
                            className={`flex gap-sm btn btn-ghost ${isActive('/') ? 'active' : ''}`}
                            style={{
                                justifyContent: 'flex-start',
                                ...(isActive('/') ? { background: 'var(--glass-bg)', borderColor: 'var(--color-primary)' } : {})
                            }}
                        >
                            <LayoutDashboard size={20} />
                            Dashboard
                        </Link>

                        <Link
                            to="/rentals"
                            onClick={closeMenu}
                            className={`flex gap-sm btn btn-ghost ${isActive('/rentals') ? 'active' : ''}`}
                            style={{
                                justifyContent: 'flex-start',
                                ...(isActive('/rentals') ? { background: 'var(--glass-bg)', borderColor: 'var(--color-primary)' } : {})
                            }}
                        >
                            <Receipt size={20} />
                            Rentas
                        </Link>

                        {currentUser?.role === 'admin' && (
                            <Link
                                to="/users"
                                onClick={closeMenu}
                                className={`flex gap-sm btn btn-ghost ${isActive('/users') ? 'active' : ''}`}
                                style={{
                                    justifyContent: 'flex-start',
                                    ...(isActive('/users') ? { background: 'var(--glass-bg)', borderColor: 'var(--color-primary)' } : {})
                                }}
                            >
                                <Users size={20} />
                                Usuarios
                            </Link>
                        )}

                        <div style={{
                            height: '1px',
                            background: 'var(--glass-border)',
                            margin: 'var(--spacing-sm) 0'
                        }}></div>

                        <button
                            onClick={() => { handleLogout(); closeMenu(); }}
                            className="btn btn-danger flex gap-sm"
                            style={{ justifyContent: 'flex-start' }}
                        >
                            <LogOut size={20} />
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            )}

            <style>{`
                /* Desktop by default */
                .desktop-nav {
                    display: flex;
                }
                .mobile-menu-btn {
                    display: none;
                }
                .mobile-menu {
                    display: none;
                }

                /* Mobile styles */
                @media (max-width: 768px) {
                    .desktop-nav {
                        display: none !important;
                    }
                    .mobile-menu-btn {
                        display: flex !important;
                    }
                    .mobile-menu {
                        display: block !important;
                    }
                }
            `}</style>
        </nav>
    );
};

export default Navbar;
