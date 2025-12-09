// Export utility for active rental data with beautiful formatting
export const exportActiveRentals = (rentals, username) => {
    const now = new Date();
    const activeRentals = rentals.filter(r => {
        const expDate = new Date(r.expirationDate);
        return expDate >= now;
    });

    if (activeRentals.length === 0) {
        alert('No hay rentas activas para exportar');
        return;
    }

    // Create beautifully formatted text file
    let content = '══════════════════════════════════════════════════════════\n';
    content += '              STREAMRENT - RENTAS ACTIVAS                  \n';
    content += '══════════════════════════════════════════════════════════\n';
    content += `\n📅 Fecha de Exportación: ${now.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}\n`;
    content += `👤 Usuario: ${username}\n`;
    content += `📊 Total de Rentas Activas: ${activeRentals.length}\n`;
    content += '\n══════════════════════════════════════════════════════════\n\n';

    activeRentals.forEach((rental, index) => {
        const expDate = new Date(rental.expirationDate);
        const startDate = new Date(rental.startDate);
        const daysRemaining = Math.ceil((expDate - now) / (1000 * 60 * 60 * 24));

        content += `┌─────────────────────────────────────────────────────────┐\n`;
        content += `│  RENTA #${(index + 1).toString().padEnd(47)}│\n`;
        if (rental.rentalId) {
            content += `│  ${rental.rentalId.padEnd(55)}│\n`;
        }
        content += `└─────────────────────────────────────────────────────────┘\n\n`;

        content += `🎬 Plataforma:        ${rental.platform}\n`;
        content += `👤 Cliente:           ${rental.customerName}\n`;

        if (rental.phoneNumber) {
            content += `📱 Teléfono:          ${rental.phoneNumber}\n`;
        }

        content += `📦 Tipo:              ${rental.accountType === 'full' ? 'Cuenta Completa' : 'Perfil'}\n`;

        if (rental.accountType === 'profile' && rental.profileName) {
            content += `🏷️  Nombre Perfil:    ${rental.profileName}\n`;
        }

        content += `💰 Precio:            $${parseFloat(rental.price).toFixed(2)}\n`;
        content += `⏱️  Duración:          ${rental.duration} días\n`;
        content += `\n━━━━━━━━━━━━━━ CREDENCIALES ━━━━━━━━━━━━━━\n`;
        content += `📧 Email:             ${rental.accountEmail}\n`;
        content += `🔐 Contraseña:        ${rental.accountPassword}\n`;
        content += `\n━━━━━━━━━━━━━━━ FECHAS ━━━━━━━━━━━━━━━━━━\n`;
        content += `📅 Inicio:            ${startDate.toLocaleDateString('es-MX')}\n`;
        content += `📅 Vencimiento:       ${expDate.toLocaleDateString('es-MX')}\n`;
        content += `⏰ Días Restantes:    ${daysRemaining} días\n`;

        if (daysRemaining <= 7) {
            content += `\n⚠️  ¡ATENCIÓN! Esta renta vence pronto\n`;
        }

        content += `\n\n`;
    });

    content += '══════════════════════════════════════════════════════════\n';
    content += '                 FIN DEL REPORTE                          \n';
    content += '           Generado por StreamRent V-1.0                  \n';
    content += '══════════════════════════════════════════════════════════\n';

    // Download the file
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const timestamp = now.toISOString().split('T')[0];
    link.download = `StreaminRentActive_${timestamp}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
