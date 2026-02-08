import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import StatsCard from '../components/StatsCard';
import RentalCard from '../components/RentalCard';
import SubscriptionWidget from '../components/SubscriptionWidget';
import { useAuth } from '../contexts/AuthContext';
import { getRentals } from '../utils/storage';
import { isExpired, isExpiringSoon } from '../utils/dateHelpers';
import { Receipt, Clock, TrendingUp, Plus, ChevronRight, Sparkles } from 'lucide-react';

// Platform colors
const platformColors = {
    'Netflix': '#E50914',
    'Spotify': '#1DB954',
    'Prime Video': '#00A8E1',
    'HBO Max': '#B100FF',
    'Disney+': '#113CCF',
    'YouTube Premium': '#FF0000',
    'Default': '#8b5cf6'
};

const Dashboard = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [rentals, setRentals] = useState([]);
    const [isMobile, setIsMobile] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        expiringSoon: 0,
        revenue: 0
    });

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        loadRentals();
        return () => window.removeEventListener('resize', checkMobile);
    }, [currentUser]);

    const loadRentals = async () => {
        const allRentals = await getRentals();
        const userRentals = currentUser.role === 'admin'
            ? allRentals
            : allRentals.filter(r => r.userId === currentUser.id);

        setRentals(userRentals);

        const activeRentals = userRentals.filter(r => !isExpired(r.expirationDate));
        const expiringSoonRentals = userRentals.filter(r => isExpiringSoon(r.expirationDate));
        const totalRevenue = userRentals.reduce((sum, r) => sum + r.price, 0);

        setStats({
            total: userRentals.length,
            active: activeRentals.length,
            expiringSoon: expiringSoonRentals.length,
            revenue: totalRevenue
        });
    };

    const recentRentals = rentals
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

    const getDaysRemaining = (expirationDate) => {
        const now = new Date();
        const exp = new Date(expirationDate);
        return Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
    };

    const currencySymbol = currentUser?.currency || '$';

    // MOBILE VERSION - Completely redesigned
    if (isMobile) {
        return (
            <Layout>
                <div style={{ paddingBottom: '80px' }}>
                    {/* Welcome Header */}
                    <div style={{
                        marginBottom: '20px',
                        padding: '20px',
                        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(6, 182, 212, 0.1))',
                        borderRadius: '16px',
                        border: '1px solid rgba(168, 85, 247, 0.2)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <div style={{
                                width: '44px',
                                height: '44px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Sparkles size={22} color="white" />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Bienvenido</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white' }}>
                                    {currentUser.username}
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats Row */}
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <div style={{
                                flex: 1,
                                padding: '10px',
                                background: 'rgba(0, 0, 0, 0.2)',
                                borderRadius: '10px',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-primary-light)' }}>
                                    {stats.total}
                                </div>
                                <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                                    Total
                                </div>
                            </div>
                            <div style={{
                                flex: 1,
                                padding: '10px',
                                background: 'rgba(0, 0, 0, 0.2)',
                                borderRadius: '10px',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-success)' }}>
                                    {stats.active}
                                </div>
                                <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                                    Activas
                                </div>
                            </div>
                            <div style={{
                                flex: 1,
                                padding: '10px',
                                background: 'rgba(0, 0, 0, 0.2)',
                                borderRadius: '10px',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: stats.expiringSoon > 0 ? 'var(--color-warning)' : 'var(--color-text-muted)' }}>
                                    {stats.expiringSoon}
                                </div>
                                <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                                    Por Vencer
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Subscription Widget */}
                    {currentUser.role !== 'admin' && currentUser.subscriptionEndDate && (
                        <div style={{ marginBottom: '20px' }}>
                            <SubscriptionWidget subscriptionEndDate={currentUser.subscriptionEndDate} />
                        </div>
                    )}

                    {/* Quick Actions */}
                    <div style={{
                        display: 'flex',
                        gap: '10px',
                        marginBottom: '20px'
                    }}>
                        <button
                            onClick={() => navigate('/rentals')}
                            style={{
                                flex: 1,
                                padding: '14px',
                                background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
                                border: 'none',
                                borderRadius: '12px',
                                color: 'white',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                boxShadow: '0 4px 15px rgba(168, 85, 247, 0.3)'
                            }}
                        >
                            <Plus size={18} /> Nueva Renta
                        </button>
                        <button
                            onClick={() => navigate('/rentals')}
                            style={{
                                flex: 1,
                                padding: '14px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '12px',
                                color: 'var(--color-text-primary)',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px'
                            }}
                        >
                            <Receipt size={18} /> Ver Todas
                        </button>
                    </div>

                    {/* Recent Rentals - Clean List */}
                    {recentRentals.length > 0 ? (
                        <div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '12px'
                            }}>
                                <h3 style={{ fontSize: '0.9rem', margin: 0, color: 'var(--color-text-primary)' }}>
                                    Actividad Reciente
                                </h3>
                            </div>

                            <div style={{
                                background: 'rgba(255, 255, 255, 0.02)',
                                borderRadius: '14px',
                                border: '1px solid var(--glass-border)',
                                overflow: 'hidden'
                            }}>
                                {recentRentals.map((rental, index) => {
                                    const days = getDaysRemaining(rental.expirationDate);
                                    const platformColor = platformColors[rental.platform] || platformColors['Default'];

                                    return (
                                        <div
                                            key={rental.id}
                                            onClick={() => navigate('/rentals', { state: { editRental: rental } })}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                padding: '12px 14px',
                                                gap: '12px',
                                                cursor: 'pointer',
                                                borderBottom: index < recentRentals.length - 1 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
                                                transition: 'background 0.2s'
                                            }}
                                        >
                                            {/* Platform Icon */}
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '10px',
                                                background: `${platformColor}20`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '1rem',
                                                fontWeight: 800,
                                                color: platformColor,
                                                flexShrink: 0
                                            }}>
                                                {rental.platform.charAt(0)}
                                            </div>

                                            {/* Info */}
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{
                                                    fontWeight: 600,
                                                    fontSize: '0.9rem',
                                                    color: 'var(--color-text-primary)',
                                                    marginBottom: '2px'
                                                }}>
                                                    {rental.platform}
                                                </div>
                                                <div style={{
                                                    fontSize: '0.75rem',
                                                    color: 'var(--color-text-muted)'
                                                }}>
                                                    {rental.customerName}
                                                </div>
                                            </div>

                                            {/* Days & Price */}
                                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                                <div style={{
                                                    fontSize: '0.85rem',
                                                    fontWeight: 700,
                                                    color: days <= 0 ? 'var(--color-danger)' :
                                                        days <= 7 ? 'var(--color-warning)' :
                                                            'var(--color-success)',
                                                    marginBottom: '2px'
                                                }}>
                                                    {days <= 0 ? 'Vencido' : `${days}d`}
                                                </div>
                                                <div style={{
                                                    fontSize: '0.7rem',
                                                    color: 'var(--color-text-muted)'
                                                }}>
                                                    {currencySymbol}{parseFloat(rental.price).toFixed(0)}
                                                </div>
                                            </div>

                                            <ChevronRight size={16} color="var(--color-text-muted)" />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        /* Empty State */
                        <div style={{
                            textAlign: 'center',
                            padding: '50px 30px',
                            background: 'rgba(255, 255, 255, 0.02)',
                            borderRadius: '16px',
                            border: '1px dashed rgba(168, 85, 247, 0.3)'
                        }}>
                            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📋</div>
                            <h3 style={{ fontSize: '1rem', marginBottom: '8px', color: 'var(--color-text-primary)' }}>
                                Sin rentas aún
                            </h3>
                            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '20px' }}>
                                Comienza agregando tu primera renta de streaming
                            </p>
                            <button
                                onClick={() => navigate('/rentals')}
                                style={{
                                    padding: '12px 24px',
                                    background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
                                    border: 'none',
                                    borderRadius: '10px',
                                    color: 'white',
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                <Plus size={18} /> Crear Primera Renta
                            </button>
                        </div>
                    )}
                </div>
            </Layout>
        );
    }

    // DESKTOP VERSION
    return (
        <Layout>
            <div>
                <div className="flex-between" style={{ marginBottom: 'var(--spacing-2xl)' }}>
                    <div>
                        <h1 style={{ marginBottom: 'var(--spacing-xs)' }}>Dashboard</h1>
                        <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>
                            Bienvenido, <span style={{ color: 'var(--color-primary-light)', fontWeight: 600 }}>{currentUser.username}</span>
                        </p>
                    </div>
                    <button onClick={() => navigate('/rentals')} className="btn btn-primary flex gap-sm">
                        <Plus size={20} /> Nueva Renta
                    </button>
                </div>

                {currentUser.role !== 'admin' && currentUser.subscriptionEndDate && (
                    <SubscriptionWidget subscriptionEndDate={currentUser.subscriptionEndDate} />
                )}

                <div className="grid grid-3" style={{ marginBottom: 'var(--spacing-2xl)' }}>
                    <div onClick={() => navigate('/rentals')} style={{ cursor: 'pointer' }}>
                        <StatsCard title="Total de Rentas" value={stats.total} icon={Receipt} color="primary" />
                    </div>
                    <div onClick={() => navigate('/rentals', { state: { filter: 'active' } })} style={{ cursor: 'pointer' }}>
                        <StatsCard title="Rentas Activas" value={stats.active} icon={TrendingUp} color="success" />
                    </div>
                    <div onClick={() => navigate('/rentals', { state: { filter: 'expiring' } })} style={{ cursor: 'pointer' }}>
                        <StatsCard title="Por Vencer" value={stats.expiringSoon} icon={Clock} color="warning" />
                    </div>
                </div>

                {recentRentals.length > 0 && (
                    <div>
                        <div className="flex-between" style={{ marginBottom: 'var(--spacing-lg)' }}>
                            <h2>Rentas Recientes</h2>
                            <button onClick={() => navigate('/rentals')} className="btn btn-ghost btn-sm">Ver Todas</button>
                        </div>
                        <div className="grid grid-3">
                            {recentRentals.slice(0, 3).map(rental => (
                                <RentalCard
                                    key={rental.id}
                                    rental={rental}
                                    onEdit={(r) => navigate('/rentals', { state: { editRental: r } })}
                                    onDelete={() => { }}
                                    onAddReplacement={() => { }}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {rentals.length === 0 && (
                    <div className="glass-card text-center" style={{ padding: 'var(--spacing-2xl)' }}>
                        <div style={{ fontSize: '4rem', marginBottom: 'var(--spacing-lg)', opacity: 0.3 }}>📊</div>
                        <h2>No hay rentas aún</h2>
                        <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-lg)' }}>
                            Comienza agregando tu primera renta
                        </p>
                        <button onClick={() => navigate('/rentals')} className="btn btn-primary flex gap-sm" style={{ margin: '0 auto' }}>
                            <Plus size={20} /> Crear Primera Renta
                        </button>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Dashboard;
