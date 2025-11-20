// setup_dev_db.js
import pg from 'pg';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
    connectionString: process.env.POSTGRES_URL_DEV,
});

const sql = fs.readFileSync('./database.sql', 'utf8');

async function setup() {
    try {
        await pool.query(sql);
        console.log('✅ Base de datos DEV inicializada correctamente.');
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}
setup();