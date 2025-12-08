// Calculate expiration date based on start date and duration in months
export const calculateExpirationDate = (startDate, durationMonths) => {
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + parseInt(durationMonths));
    return date.toISOString();
};

// Get days until expiration
export const getDaysUntilExpiration = (expirationDate) => {
    const now = new Date();
    const expDate = new Date(expirationDate);
    const diffTime = expDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};

// Check if rental is expired
export const isExpired = (expirationDate) => {
    return getDaysUntilExpiration(expirationDate) < 0;
};

// Check if rental is expiring soon (within threshold days)
export const isExpiringSoon = (expirationDate, daysThreshold = 7) => {
    const days = getDaysUntilExpiration(expirationDate);
    return days >= 0 && days <= daysThreshold;
};

// Format date for display
export const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

// Format date for input fields (YYYY-MM-DD)
export const formatDateForInput = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
};

// Get relative time (e.g., "in 5 days", "2 days ago")
export const getRelativeTime = (dateString) => {
    const days = getDaysUntilExpiration(dateString);

    if (days < 0) {
        const absDays = Math.abs(days);
        return `hace ${absDays} día${absDays !== 1 ? 's' : ''}`;
    } else if (days === 0) {
        return 'hoy';
    } else if (days === 1) {
        return 'mañana';
    } else {
        return `en ${days} días`;
    }
};
