import app from '../src/app.js';

// Vercel necesita que exportemos "default" la instancia de Express
export default function handler(req, res) {
    return app(req, res);
}