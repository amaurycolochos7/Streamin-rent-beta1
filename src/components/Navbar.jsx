import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, LayoutDashboard, Receipt, Users, Sparkles } from 'lucide-react';

const Navbar = () => {
    const { currentUser, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Show navbar when scrolling up or at the top
            if (currentScrollY < lastScrollY || currentScrollY < 10) {
                setIsVisible(true);
            } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
                // Hide navbar when scrolling down and past 100px
                setIsVisible(false);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [lastScrollY]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <nav
            className="glass-card"
            style={{
                margin: 'var(--spacing-lg)',
                marginBottom: 0,
                position: 'sticky',
                top: 'var(--spacing-lg)',
                zIndex: 100,
                transform: isVisible ? 'translateY(0)' : 'translateY(-150%)',
                transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                opacity: isVisible ? 1 : 0
            }}
        >
            <div className="flex-between">
                <div className="flex gap-lg" style={{ alignItems: 'center' }}>
                    <div className="flex gap-sm" style={{ alignItems: 'center' }}>
                        <Sparkles size={28} color="var(--color-primary-light)" />
                        <h3 style={{ margin: 0, background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-secondary-light))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            StreamRent
                        </h3>
                    </div>

                    <div className="flex gap-md" style={{ marginLeft: 'var(--spacing-xl)' }}>
                        <Link
                            to="/"
                            className={`flex gap-sm btn btn-ghost btn-sm ${isActive('/') ? 'active' : ''}`}
                            style={isActive('/') ? { background: 'var(--glass-bg)', borderColor: 'var(--color-primary)' } : {}}
                        >
                            <LayoutDashboard size={18} />
                            Dashboard
                        </Link>

                        <Link
                            to="/rentals"
                            className={`flex gap-sm btn btn-ghost btn-sm ${isActive('/rentals') ? 'active' : ''}`}
                            style={isActive('/rentals') ? { background: 'var(--glass-bg)', borderColor: 'var(--color-primary)' } : {}}
                        >
                            <Receipt size={18} />
                            Rentas
                        </Link>

                        {currentUser?.role === 'admin' && (
                            <Link
                                to="/users"
                                className={`flex gap-sm btn btn-ghost btn-sm ${isActive('/users') ? 'active' : ''}`}
                                style={isActive('/users') ? { background: 'var(--glass-bg)', borderColor: 'var(--color-primary)' } : {}}
                            >
                                <Users size={18} />
                                Usuarios
                            </Link>
                        )}
                    </div>
                </div>

                <div className="flex gap-md" style={{ alignItems: 'center' }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                            {currentUser?.username}
                        </div>
                        <div className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                            {currentUser?.role}
                        </div>
                    </div>

                    <button onClick={handleLogout} className="btn btn-ghost btn-sm flex gap-sm">
                        <LogOut size={18} />
                        Salir
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
