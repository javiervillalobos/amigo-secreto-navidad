import request from 'supertest';
import { resetDatabase, closeDatabase } from './test_helper.js';
import app from '../src/server.js'; // Importaremos la App (aún no creada)

describe('API Endpoints Integration', () => {
    
    // Limpieza de DB antes de cada test (igual que antes)
    beforeEach(async () => {
        await resetDatabase();
    });

    afterAll(async () => {
        await closeDatabase();
    });


    test('POST /unirse debe registrar usuario y regalo en una sola llamada', async () => {
        const payload = {
            nombre: 'Usuario Unificado',
            email: 'unificado@test.com',
            nombre_regalo: 'Libro de Cocina',
            precio: 25000,
            url_regalo: 'http://libro.com'
        };

        const response = await request(app)
            .post('/unirse') // Nueva ruta
            .send(payload);

        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty('usuario');
        expect(response.body).toHaveProperty('regalo');
        expect(response.body.usuario.email).toBe('unificado@test.com');
        expect(response.body.regalo.nombre_regalo).toBe('Libro de Cocina');
    });    

    test('POST /api/sorteo debe realizar sorteo, enviar correos y devolver 201', async () => {

        for (let i = 1; i <= 3; i++) {
            const payload = {
                nombre: 'Usuario Unificado ' + i,
                email: 'unificado' + i + '@test.com',
                nombre_regalo: 'Libro de Cocina ' + i,
                precio: 25000,
                url_regalo: 'http://libro.com'
            };
        
            const response = await request(app)
            .post('/unirse') // Nueva ruta
            .send(payload);

            expect(response.statusCode).toBe(201);
            expect(response.body).toHaveProperty('usuario');
            expect(response.body).toHaveProperty('regalo');
            expect(response.body.usuario.email).toBe('unificado' + i + '@test.com');
            expect(response.body.regalo.nombre_regalo).toBe('Libro de Cocina ' + i);
        }

        const responseSorteo = await request(app)
            .post('/sorteo');

        expect(responseSorteo.statusCode).toBe(200);
        expect(responseSorteo.headers['content-type']).toMatch(/json/);
        expect(responseSorteo.body).toHaveProperty('mensaje');
        expect(responseSorteo.body).toHaveProperty('detalle');
        expect(responseSorteo.body.mensaje).toContain('Sorteo realizado');
        expect(responseSorteo.body.detalle).toHaveLength(3);
    });
}); 