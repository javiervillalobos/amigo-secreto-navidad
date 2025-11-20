import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar .env (solo afecta en local, en Vercel se ignora si no existe el archivo)
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

const { Pool } = pg;

// --- LÓGICA DE SELECCIÓN DE BASE DE DATOS (3 ESCENARIOS) ---
let connectionString;

if (process.env.NODE_ENV === 'test') {
    // 1. ESCENARIO TESTS (Local)
    connectionString = process.env.POSTGRES_URL_TEST;
} else if (process.env.POSTGRES_URL) {
    // 2. ESCENARIO PRODUCCIÓN (Vercel)
    // Vercel inyecta automáticamente 'POSTGRES_URL' cuando conectas la DB
    connectionString = process.env.POSTGRES_URL;
} else {
    // 3. ESCENARIO DESARROLLO (Local sin variable de prod)
    connectionString = process.env.POSTGRES_URL_DEV;
}

// Validación de seguridad
if (!connectionString) {
    throw new Error(`FATAL: No hay Connection String para el entorno: ${process.env.NODE_ENV}`);
}

// Configuración del Pool (detectando SSL necesario para Vercel)
const pool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export default pool;