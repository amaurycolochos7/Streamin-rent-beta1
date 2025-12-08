import React from 'react';
import { getDaysUntilExpiration, isExpired, isExpiringSoon } from '../utils/dateHelpers';
import { AlertCircle, Clock, CheckCircle } from 'lucide-react';

const ExpirationBadge = ({ expirationDate }) => {
    const days = getDaysUntilExpiration(expirationDate);
    const expired = isExpired(expirationDate);
    const expiringSoon = isExpiringSoon(expirationDate);

    if (expired) {
        return (
            <div className="badge badge-danger flex gap-sm">
                <AlertCircle size={12} />
                Expirado
            </div>
        );
    }

    if (expiringSoon) {
        return (
            <div className="badge badge-warning flex gap-sm">
                <Clock size={12} />
                {days} día{days !== 1 ? 's' : ''}
            </div>
        );
    }

    return (
        <div className="badge badge-success flex gap-sm">
            <CheckCircle size={12} />
            {days} días
        </div>
    );
};

export default ExpirationBadge;
