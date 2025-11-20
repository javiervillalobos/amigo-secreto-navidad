import express from 'express';
import pool from './config/db.js';
import path from 'path'; // <--- Importar path
import { fileURLToPath } from 'url'; // <--- Necesario para __dirname en ES Modules
import emailClient from './config/email.js'; // Asegúrate de tener este archivo o un mock
import { SorteoService } from './services/SorteoService.js';
import { WhatsAppService } from './services/WhatsAppService.js';
import { SorteoController } from './controllers/SorteoController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// 1. Instancias e Inyección
const whatsAppService = new WhatsAppService();
const service = new SorteoService(pool, emailClient, whatsAppService);
const controller = new SorteoController(service);

const app = express();
app.use(express.json());

// Servir estáticos (Frontend)
app.use(express.static(path.join(__dirname, '../public')));
app.use('/sorteo', controller.realizarSorteo);  
app.use('/unirse', controller.unirse);  

if (process.env.NODE_ENV !== 'production' && process.argv[1] === fileURLToPath(import.meta.url)) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`🚀 Servidor local corriendo en http://localhost:${PORT}`);
    });
}

export default app;