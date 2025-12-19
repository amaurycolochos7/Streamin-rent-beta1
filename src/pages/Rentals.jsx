import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import RentalCard from '../components/RentalCard';
import CustomerGroup from '../components/CustomerGroup';
import RentalForm from '../components/RentalForm';
import ReplacementForm from '../components/ReplacementForm';
import { useAuth } from '../contexts/AuthContext';
import { getRentals, saveRental, deleteRental, generateRentalId, saveReplacement } from '../utils/storage';
import { exportActiveRentals } from '../utils/exportActiveRentals';
import { Plus, Search, Filter, Download, Users, List } from 'lucide-react';

const Rentals = () => {
    const { currentUser } = useAuth();
    const location = useLocation();
    const [rentals, setRentals] = useState([]);
    const [filteredRentals, setFilteredRentals] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showRentalForm, setShowRentalForm] = useState(false);
    const [showReplacementForm, setShowReplacementForm] = useState(false);
    const [editingRental, setEditingRental] = useState(null);
    const [replacementRental, setReplacementRental] = useState(null);
    const [isMobile, setIsMobile] = useState(false);
    const [viewMode, setViewMode] = useState('grouped'); // 'grouped' or 'list'

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        loadRentals();

        if (location.state?.editRental) {
            handleEdit(location.state.editRental);
        }
        if (location.state?.filter) {
            setFilterStatus(location.state.filter);
        }

        return () => window.removeEventListener('resize', checkMobile);
    }, [currentUser, location.state]);

    useEffect(() => {
        filterRentals();
    }, [rentals, searchTerm, filterStatus]);

    const loadRentals = async () => {
        const allRentals = await getRentals();
        const userRentals = currentUser.role === 'admin'
            ? allRentals
            : allRentals.filter(r => r.userId === currentUser.id);
        setRentals(userRentals);
    };

    const filterRentals = () => {
        let filtered = [...rentals];

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(r =>
                (r.rentalId && r.rentalId.toLowerCase().includes(term)) ||
                r.platform.toLowerCase().includes(term) ||
                r.customerName.toLowerCase().includes(term) ||
                r.accountEmail.toLowerCase().includes(term)
            );
        }

        if (filterStatus !== 'all') {
            const now = new Date();
            filtered = filtered.filter(r => {
                const expirationDate = new Date(r.expirationDate);
                const daysUntil = Math.ceil((expirationDate - now) / (1000 * 60 * 60 * 24));

                if (filterStatus === 'active') return daysUntil > 7;
                if (filterStatus === 'expiring') return daysUntil >= 0 && daysUntil <= 7;
                if (filterStatus === 'expired') return daysUntil < 0;
                return true;
            });
        }

        setFilteredRentals(filtered);
    };

    // Group rentals by customer name
    const groupedRentals = filteredRentals.reduce((groups, rental) => {
        const name = rental.customerName.toLowerCase().trim();
        if (!groups[name]) {
            groups[name] = [];
        }
        groups[name].push(rental);
        return groups;
    }, {});

    const handleSaveRental = async (rentalData) => {
        try {
            if (editingRental) {
                await saveRental({
                    id: editingRental.id,
                    userId: currentUser.id,
                    ...rentalData
                });
            } else {
                const rentalId = await generateRentalId();
                await saveRental({
                    rentalId,
                    userId: currentUser.id,
                    ...rentalData
                });
            }

            setShowRentalForm(false);
            setEditingRental(null);
            await loadRentals();
        } catch (error) {
            console.error('Save failed:', error);
            alert('Error al guardar la renta: ' + error.message);
        }
    };

    const handleDelete = async (rentalId) => {
        if (!confirm('¿Eliminar esta renta?')) return;

        try {
            await deleteRental(rentalId);
            await loadRentals();
        } catch (error) {
            console.error('Error deleting:', error);
            alert('Error al eliminar');
        }
    };

    const handleEdit = (rental) => {
        setEditingRental(rental);
        setShowRentalForm(true);
    };

    const handleAddReplacement = (rental) => {
        setReplacementRental(rental);
        setShowReplacementForm(true);
    };

    const handleSaveReplacement = async (replacementData) => {
        try {
            await saveReplacement({
                rentalId: replacementRental.id,
                oldEmail: replacementRental.accountEmail,
                oldPassword: replacementRental.accountPassword,
                newEmail: replacementData.newCredentials.email,
                newPassword: replacementData.newCredentials.password,
                reason: replacementData.reason
            });

            setShowReplacementForm(false);
            setReplacementRental(null);
            await loadRentals();
        } catch (error) {
            console.error('Error:', error);
            alert('Error al guardar');
        }
    };

    // MOBILE VERSION
    if (isMobile) {
        return (
            <Layout>
                <div>
                    {/* Header */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '10px'
                    }}>
                        <h1 style={{
                            margin: 0,
                            fontSize: '1.2rem',
                            background: 'linear-gradient(135deg, var(--color-primary-light), var(--color-secondary-light))',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            Rentas
                        </h1>
                        <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                                onClick={() => exportActiveRentals(rentals, currentUser.username)}
                                disabled={rentals.length === 0}
                                style={{
                                    width: '34px',
                                    height: '34px',
                                    borderRadius: '8px',
                                    background: 'rgba(6, 182, 212, 0.15)',
                                    border: '1px solid rgba(6, 182, 212, 0.3)',
                                    color: 'var(--color-secondary-light)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer'
                                }}
                            >
                                <Download size={16} />
                            </button>
                            <button
                                onClick={() => {
                                    setEditingRental(null);
                                    setShowRentalForm(true);
                                }}
                                style={{
                                    width: '34px',
                                    height: '34px',
                                    borderRadius: '8px',
                                    background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
                                    border: 'none',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 8px rgba(168, 85, 247, 0.3)'
                                }}
                            >
                                <Plus size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Search, Filter & View Toggle - All in one row */}
                    <div style={{
                        display: 'flex',
                        gap: '6px',
                        marginBottom: '10px',
                        alignItems: 'center'
                    }}>
                        {/* Search */}
                        <div style={{ flex: 1, position: 'relative' }}>
                            <Search
                                size={14}
                                style={{
                                    position: 'absolute',
                                    left: '8px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--color-text-muted)'
                                }}
                            />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Buscar..."
                                style={{
                                    width: '100%',
                                    padding: '8px 8px 8px 28px',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '8px',
                                    color: 'var(--color-text-primary)',
                                    fontSize: '0.8rem'
                                }}
                            />
                        </div>

                        {/* Filter Dropdown */}
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            style={{
                                padding: '8px 6px',
                                background: '#1a0a2e',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '8px',
                                color: 'var(--color-text-primary)',
                                fontSize: '0.7rem',
                                minWidth: '70px'
                            }}
                        >
                            <option value="all">Todas</option>
                            <option value="active">Activas</option>
                            <option value="expiring">Vencer</option>
                            <option value="expired">Exp.</option>
                        </select>

                        {/* View Toggle - Compact icons only */}
                        <div style={{
                            display: 'flex',
                            gap: '2px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '8px',
                            padding: '2px'
                        }}>
                            <button
                                onClick={() => setViewMode('grouped')}
                                title="Por Cliente"
                                style={{
                                    padding: '6px 8px',
                                    borderRadius: '6px',
                                    border: 'none',
                                    background: viewMode === 'grouped' ? 'rgba(168, 85, 247, 0.3)' : 'transparent',
                                    color: viewMode === 'grouped' ? 'var(--color-primary-light)' : 'var(--color-text-muted)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                <Users size={14} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                title="Lista"
                                style={{
                                    padding: '6px 8px',
                                    borderRadius: '6px',
                                    border: 'none',
                                    background: viewMode === 'list' ? 'rgba(168, 85, 247, 0.3)' : 'transparent',
                                    color: viewMode === 'list' ? 'var(--color-primary-light)' : 'var(--color-text-muted)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                <List size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    {filteredRentals.length > 0 ? (
                        viewMode === 'grouped' ? (
                            // GROUPED VIEW - By Customer
                            <div>
                                {Object.entries(groupedRentals)
                                    .sort((a, b) => a[0].localeCompare(b[0]))
                                    .map(([name, customerRentals]) => (
                                        <CustomerGroup
                                            key={name}
                                            customerName={customerRentals[0].customerName}
                                            rentals={customerRentals}
                                            onEdit={handleEdit}
                                            onDelete={handleDelete}
                                            onAddReplacement={handleAddReplacement}
                                            currencySymbol={currentUser?.currency || '$'}
                                        />
                                    ))}
                            </div>
                        ) : (
                            // LIST VIEW - Individual cards
                            <div>
                                {filteredRentals.map(rental => (
                                    <RentalCard
                                        key={rental.id}
                                        rental={rental}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        onAddReplacement={handleAddReplacement}
                                    />
                                ))}
                            </div>
                        )
                    ) : (
                        <div style={{
                            textAlign: 'center',
                            padding: '40px 20px',
                            background: 'rgba(255, 255, 255, 0.03)',
                            borderRadius: '12px'
                        }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '10px', opacity: 0.3 }}>
                                {searchTerm || filterStatus !== 'all' ? '🔍' : '📋'}
                            </div>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                                {searchTerm || filterStatus !== 'all'
                                    ? 'Sin resultados'
                                    : 'No hay rentas aún'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Modals */}
                {showRentalForm && (
                    <RentalForm
                        rental={editingRental}
                        onSave={handleSaveRental}
                        onClose={() => {
                            setShowRentalForm(false);
                            setEditingRental(null);
                        }}
                    />
                )}

                {showReplacementForm && (
                    <ReplacementForm
                        rental={replacementRental}
                        onSave={handleSaveReplacement}
                        onClose={() => {
                            setShowReplacementForm(false);
                            setReplacementRental(null);
                        }}
                    />
                )}
            </Layout>
        );
    }

    // DESKTOP VERSION
    return (
        <Layout>
            <div>
                <div className="flex-between" style={{ marginBottom: 'var(--spacing-2xl)' }}>
                    <div>
                        <h1 style={{ marginBottom: 'var(--spacing-xs)' }}>
                            Gestión de Rentas
                        </h1>
                        <p style={{ color: 'var(--color-text-muted)', margin: 0 }}>
                            Administra todas tus rentas de streaming
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                        <button
                            onClick={() => exportActiveRentals(rentals, currentUser.username)}
                            className="btn btn-secondary flex gap-sm"
                            disabled={rentals.length === 0}
                        >
                            <Download size={20} />
                            Descargar Activas
                        </button>
                        <button
                            onClick={() => {
                                setEditingRental(null);
                                setShowRentalForm(true);
                            }}
                            className="btn btn-primary flex gap-sm"
                        >
                            <Plus size={20} />
                            Nueva Renta
                        </button>
                    </div>
                </div>

                <div className="glass-card" style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <div className="flex gap-md" style={{ flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '250px' }}>
                            <div style={{ position: 'relative' }}>
                                <Search
                                    size={20}
                                    style={{
                                        position: 'absolute',
                                        left: '1rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: 'var(--color-text-muted)'
                                    }}
                                />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="form-input"
                                    placeholder="Buscar por ID, plataforma, cliente o email..."
                                    style={{ paddingLeft: '3rem' }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
                            <Filter size={20} color="var(--color-text-muted)" />
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="form-select"
                                style={{ minWidth: '150px' }}
                            >
                                <option value="all">Todas</option>
                                <option value="active">Activas</option>
                                <option value="expiring">Por Vencer</option>
                                <option value="expired">Expiradas</option>
                            </select>
                        </div>
                    </div>
                </div>

                {filteredRentals.length > 0 ? (
                    <div className="grid grid-3">
                        {filteredRentals.map(rental => (
                            <RentalCard
                                key={rental.id}
                                rental={rental}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onAddReplacement={handleAddReplacement}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="glass-card text-center" style={{ padding: 'var(--spacing-2xl)' }}>
                        <div style={{ fontSize: '4rem', marginBottom: 'var(--spacing-lg)', opacity: 0.3 }}>
                            {searchTerm || filterStatus !== 'all' ? '🔍' : '📋'}
                        </div>
                        <h2>
                            {searchTerm || filterStatus !== 'all'
                                ? 'No se encontraron resultados'
                                : 'No hay rentas aún'}
                        </h2>
                        <p style={{ color: 'var(--color-text-muted)' }}>
                            {searchTerm || filterStatus !== 'all'
                                ? 'Intenta con otros términos'
                                : 'Comienza agregando tu primera renta'}
                        </p>
                    </div>
                )}
            </div>

            {showRentalForm && (
                <RentalForm
                    rental={editingRental}
                    onSave={handleSaveRental}
                    onClose={() => {
                        setShowRentalForm(false);
                        setEditingRental(null);
                    }}
                />
            )}

            {showReplacementForm && (
                <ReplacementForm
                    rental={replacementRental}
                    onSave={handleSaveReplacement}
                    onClose={() => {
                        setShowReplacementForm(false);
                        setReplacementRental(null);
                    }}
                />
            )}
        </Layout>
    );
};

export default Rentals;
