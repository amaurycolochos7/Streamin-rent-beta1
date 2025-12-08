import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import StatsCard from '../components/StatsCard';
import RentalCard from '../components/RentalCard';
import { useAuth } from '../contexts/AuthContext';
import { getRentals } from '../utils/storage';
import { isExpired, isExpiringSoon } from '../utils/dateHelpers';
import { Receipt, DollarSign, Clock, Users, TrendingUp, Plus } from 'lucide-react';

const Dashboard = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [rentals, setRentals] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        expiringSoon: 0,
        revenue: 0
    });

    useEffect(() => {
        loadRentals();
    }, [currentUser]);

    const loadRentals = async () => {
        const allRentals = await getRentals();

        // Filter rentals based on user role
        const userRentals = currentUser.role === 'admin'
            ? allRentals
            : allRentals.filter(r => r.userId === currentUser.id);

        setRentals(userRentals);

        // Calculate stats
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
        .slice(0, 3);

    return (
        <Layout>
            <div className="animate-fade-in">
                <div className="flex-between" style={{ marginBottom: 'var(--spacing-2xl)' }}>
                    <div>
                        <h1 style={{ marginBottom: 'var(--spacing-xs)' }}>
                            Dashboard
                        </h1>
                        <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>
                            Bienvenido de nuevo, <span style={{ color: 'var(--color-primary-light)', fontWeight: 600 }}>{currentUser.username}</span>
                        </p>
                    </div>

                    <button
                        onClick={() => navigate('/rentals')}
                        className="btn btn-primary flex gap-sm"
                    >
                        <Plus size={20} />
                        Nueva Renta
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-3" style={{ marginBottom: 'var(--spacing-2xl)' }}>
                    <div onClick={() => navigate('/rentals')} style={{ cursor: 'pointer' }}>
                        <StatsCard
                            title="Total de Rentas"
                            value={stats.total}
                            icon={Receipt}
                            color="primary"
                        />
                    </div>
                    <div onClick={() => navigate('/rentals', { state: { filter: 'active' } })} style={{ cursor: 'pointer' }}>
                        <StatsCard
                            title="Rentas Activas"
                            value={stats.active}
                            icon={TrendingUp}
                            color="success"
                        />
                    </div>
                    <div onClick={() => navigate('/rentals', { state: { filter: 'expiring' } })} style={{ cursor: 'pointer' }}>
                        <StatsCard
                            title="Por Vencer"
                            value={stats.expiringSoon}
                            icon={Clock}
                            color="warning"
                        />
                    </div>
                </div>

                {/* Recent Rentals */}
                {recentRentals.length > 0 && (
                    <div>
                        <div className="flex-between" style={{ marginBottom: 'var(--spacing-lg)' }}>
                            <h2>Rentas Recientes</h2>
                            <button
                                onClick={() => navigate('/rentals')}
                                className="btn btn-ghost btn-sm"
                            >
                                Ver Todas
                            </button>
                        </div>

                        <div className="grid grid-3">
                            {recentRentals.map(rental => (
                                <RentalCard
                                    key={rental.id}
                                    rental={rental}
                                    onEdit={(rental) => navigate('/rentals', { state: { editRental: rental } })}
                                    onDelete={() => { }}
                                    onAddReplacement={() => { }}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {rentals.length === 0 && (
                    <div className="glass-card text-center" style={{ padding: 'var(--spacing-2xl)' }}>
                        <div style={{
                            fontSize: '4rem',
                            marginBottom: 'var(--spacing-lg)',
                            opacity: 0.3
                        }}>
                            📊
                        </div>
                        <h2>No hay rentas aún</h2>
                        <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-lg)' }}>
                            Comienza agregando tu primera renta de streaming
                        </p>
                        <button
                            onClick={() => navigate('/rentals')}
                            className="btn btn-primary flex gap-sm"
                            style={{ margin: '0 auto' }}
                        >
                            <Plus size={20} />
                            Crear Primera Renta
                        </button>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Dashboard;
