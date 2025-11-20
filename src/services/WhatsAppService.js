export class WhatsAppService {
    async enviarMensaje(telefono, mensaje) {
        // AQUÍ IRÍA LA LÓGICA DE TWILIO O META API
        // Para el MVP, simulamos el envío con un log bonito.
        
        console.log(`
        📱 [WHATSAPP SIMULADO] 
        ---------------------------------------------------
        To: ${telefono}
        Body: ${mensaje}
        ---------------------------------------------------
        `);
        
        // Simulamos retardo de red
        return Promise.resolve(true);
    }
}