import 'dotenv/config'; // Asegura cargar las variables
import nodemailer from 'nodemailer';

// Validar que las credenciales existan
const { GMAIL_USER, GMAIL_APP_PASS } = process.env;

if (!GMAIL_USER || !GMAIL_APP_PASS) {
    console.warn('⚠️ ADVERTENCIA: Faltan credenciales de Gmail en .env');
}

// Crear el transporter reutilizable
const emailClient = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASS,
    },
});

export default emailClient;