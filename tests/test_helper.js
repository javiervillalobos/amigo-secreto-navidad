import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../api/config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sqlPath = path.join(__dirname, '../database.sql');
const sql = fs.readFileSync(sqlPath, 'utf8');

export const resetDatabase = async () => {
    await pool.query(sql);
};

export const closeDatabase = async () => {
    await pool.end();
};