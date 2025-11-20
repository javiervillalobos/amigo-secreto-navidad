import express from 'express';
import pool from './config/db.js';
import path from 'path'; // <--- Importar path
import { fileURLToPath } from 'url'; // <--- Necesario para __dirname en ES Modules
import emailClient from './config/email.js'; // Asegúrate de tener este archivo o un mock
import { SorteoService } from './services/SorteoService.js';
import { SorteoController } from './controllers/SorteoController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// 1. Instancias e Inyección
const service = new SorteoService(pool, emailClient);
const controller = new SorteoController(service);

// 2. Configurar Express
const app = express();
app.use(express.json());

app.use(express.static(path.join(__dirname, '../public')));

// 3. Definir Rutas
app.post('/api/registrar', controller.registrar);
app.post('/api/regalo', controller.guardarRegalo);
app.post('/api/sorteo', controller.realizarSorteo);

export default app;