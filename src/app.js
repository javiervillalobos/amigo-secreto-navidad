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

const app = express();
app.use(express.json());

// Servir estáticos (Frontend)
app.use(express.static(path.join(__dirname, '../public')));

// DEFINICIÓN DE RUTAS MÁS SEGURA:
// Creamos un Router específico para la API
const apiRouter = express.Router();

apiRouter.post('/registrar', controller.registrar);
apiRouter.post('/regalo', controller.guardarRegalo);
apiRouter.post('/sorteo', controller.realizarSorteo);

// Le decimos a Express que use ese router para todo lo que empiece por /api
app.use('/api', apiRouter);

export default app;