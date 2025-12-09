// Export utility for rental data
export const exportRentalsToText = (rentals, username) => {
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount, currency = '$') => {
        return `${currency}${parseFloat(amount).toFixed(2)}`;
    };

    let content = `========================================\n`;
    content += `BACKUP DE RENTAS - StreamRent\n`;
    content += `Usuario: ${username}\n`;
    content += `Fecha de Exportación: ${formatDate(new Date().toISOString())}\n`;
    content += `Total de Rentas: ${rentals.length}\n`;
    content += `========================================\n\n`;

    if (rentals.length === 0) {
        content += `No hay rentas registradas.\n`;
    } else {
        rentals.forEach((rental, index) => {
            content += `RENTA #${index + 1}\n`;
            content += `--------\n`;
            content += `ID de Renta: ${rental.rentalId || 'N/A'}\n`;
            content += `Plataforma: ${rental.platform}\n`;
            content += `Cliente: ${rental.customerName}\n`;

            if (rental.phoneNumber) {
                content += `Teléfono: ${rental.phoneNumber}\n`;
            }

            content += `Tipo de Cuenta: ${rental.accountType === 'full' ? 'Cuenta Completa' : 'Perfil'}\n`;

            if (rental.accountType === 'profile' && rental.profileName) {
                content += `Nombre del Perfil: ${rental.profileName}\n`;
            }

            content += `Duración: ${rental.duration} días\n`;
            content += `Precio: ${formatCurrency(rental.price, rental.currency || '$')}\n`;
            content += `Email de la Cuenta: ${rental.accountEmail}\n`;
            content += `Contraseña: ${rental.accountPassword}\n`;
            content += `Fecha de Inicio: ${formatDate(rental.startDate)}\n`;
            content += `Fecha de Vencimiento: ${formatDate(rental.expirationDate)}\n`;

            // Calculate days remaining
            const now = new Date();
            const expDate = new Date(rental.expirationDate);
            const daysRemaining = Math.ceil((expDate - now) / (1000 * 60 * 60 * 24));

            if (daysRemaining < 0) {
                content += `Estado: Vencida\n`;
            } else if (daysRemaining <= 3) {
                content += `Estado: Por vencer (${daysRemaining} días restantes)\n`;
            } else {
                content += `Estado: Activa (${daysRemaining} días restantes)\n`;
            }

            content += `\n\n`;
        });
    }

    content += `========================================\n`;
    content += `Fin del backup\n`;
    content += `Generado por StreamRent V-1.0\n`;
    content += `========================================\n`;

    // Create and download file
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    const timestamp = new Date().toISOString().split('T')[0];
    link.download = `backup_rentas_${username}_${timestamp}.txt`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
