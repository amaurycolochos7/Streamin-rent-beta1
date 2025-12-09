import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import RentalCard from '../components/RentalCard';
import RentalForm from '../components/RentalForm';
import ReplacementForm from '../components/ReplacementForm';
import { useAuth } from '../contexts/AuthContext';
import { getRentals, saveRental, deleteRental, generateRentalId, saveReplacement } from '../utils/storage';
import { exportActiveRentals } from '../utils/exportActiveRentals';
import { Plus, Search, Filter, Download } from 'lucide-react';

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


    useEffect(() => {
        loadRentals();

        // Check if we came here with an edit intent
        if (location.state?.editRental) {
            handleEdit(location.state.editRental);
        }

        // Check if we came here with a filter from Dashboard
        if (location.state?.filter) {
            setFilterStatus(location.state.filter);
        }
    }, [currentUser, location.state]);

    useEffect(() => {
        filterRentals();
    }, [rentals, searchTerm, filterStatus]);

    const loadRentals = async () => {
        const allRentals = await getRentals();

        // Filter rentals based on user role
        const userRentals = currentUser.role === 'admin'
            ? allRentals
            : allRentals.filter(r => r.userId === currentUser.id);

        setRentals(userRentals);
    };

    const filterRentals = () => {
        let filtered = [...rentals];

        // Enhanced search filter - searches in ID, customer name, and account email
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(r =>
                (r.rentalId && r.rentalId.toLowerCase().includes(term)) ||
                r.platform.toLowerCase().includes(term) ||
                r.customerName.toLowerCase().includes(term) ||
                r.accountEmail.toLowerCase().includes(term)
            );
        }

        // Status filter
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

    const handleSaveRental = async (rentalData) => {
        console.log('[Rentals] Starting save rental:', {
            isEditing: !!editingRental,
            currentUser: currentUser?.username,
            rentalData
        });

        try {
            if (editingRental) {
                console.log('[Rentals] Updating existing rental:', editingRental.id);
                // Edit existing rental
                await saveRental({
                    id: editingRental.id,
                    userId: currentUser.id,
                    ...rentalData
                });
            } else {
                console.log('[Rentals] Creating new rental');
                // Create new rental
                const rentalId = await generateRentalId();
                console.log('[Rentals] Generated rental ID:', rentalId);
                await saveRental({
                    rentalId,
                    userId: currentUser.id,
                    ...rentalData
                });
            }

            console.log('[Rentals] Save successful, closing form');
            setShowRentalForm(false);
            setEditingRental(null);
            console.log('[Rentals] Reloading rentals list');
            await loadRentals();
            console.log('[Rentals] Save operation completed');
        } catch (error) {
            console.error('[Rentals] Save failed with error:', error);
            console.error('[Rentals] Error details:', {
                message: error.message,
                stack: error.stack
            });
            alert('Error al guardar la renta: ' + error.message);
            throw error; // Re-throw to ensure error is visible
        }
    };

    const handleDelete = async (rentalId) => {
        if (!confirm('¿Estás seguro de eliminar esta renta?')) return;

        try {
            await deleteRental(rentalId);
            await loadRentals();
        } catch (error) {
            console.error('Error deleting rental:', error);
            alert('Error al eliminar la renta');
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
            console.error('Error saving replacement:', error);
            alert('Error al guardar la reposición');
        }
    };

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

                {/* Filters */}
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

                {/* Rentals Grid */}
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
                        <div style={{
                            fontSize: '4rem',
                            marginBottom: 'var(--spacing-lg)',
                            opacity: 0.3
                        }}>
                            {searchTerm || filterStatus !== 'all' ? '🔍' : '📋'}
                        </div>
                        <h2>
                            {searchTerm || filterStatus !== 'all'
                                ? 'No se encontraron resultados'
                                : 'No hay rentas aún'}
                        </h2>
                        <p style={{ color: 'var(--color-text-muted)' }}>
                            {searchTerm || filterStatus !== 'all'
                                ? 'Intenta con otros términos de búsqueda'
                                : 'Comienza agregando tu primera renta'}
                        </p>
                    </div>
                )}
            </div>

            {/* Rental Form Modal */}
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

            {/* Replacement Form Modal */}
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
