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

    test('POST /registrar debe crear un usuario y devolver 201', async () => {
        const nuevoUsuario = { nombre: 'Usuario API', email: 'api@test.com' };

        // Usamos supertest para simular el POST
        const response = await request(app)
            .post('/registrar')
            .send(nuevoUsuario);

        // Validaciones HTTP
        expect(response.statusCode).toBe(201);
        expect(response.headers['content-type']).toMatch(/json/);
        // Validaciones de Datos
        expect(response.body).toHaveProperty('id');
        expect(response.body.email).toBe('api@test.com');
    });

    test('POST /regalo debe guardar un regalo y devolver 201', async () => {
        const nuevoUsuario = { nombre: 'Usuario API', email: 'api@test.com' };
        const nuevoRegalo = { 
            email: 'api@test.com', 
            nombre_regalo: 'Nintendo Switch', 
            url_regalo: 'http://foto.com',
            precio: 45000 
        }        

        // Usamos supertest para simular el POST
        const responseUsuario = await request(app)
            .post('/registrar')
            .send(nuevoUsuario);

        const responseRegalo = await request(app)
            .post('/regalo')
            .send(nuevoRegalo);


        expect(responseUsuario.statusCode).toBe(201);
        expect(responseUsuario.headers['content-type']).toMatch(/json/);
        expect(responseUsuario.body).toHaveProperty('id');
        expect(responseUsuario.body.email).toBe('api@test.com');

        expect(responseRegalo.statusCode).toBe(201);
        expect(responseRegalo.headers['content-type']).toMatch(/json/);
        expect(responseRegalo.body).toHaveProperty('id');
        expect(responseRegalo.body.nombre_regalo).toBe('Nintendo Switch');
        expect(responseRegalo.body.miembro_id).toBe(responseUsuario.body.id);

    });

    test('POST /api/sorteo debe realizar sorteo, enviar correos y devolver 201', async () => {

        for (let i = 1; i <= 3; i++) {
            const usuario = { nombre: 'Usuario API ' + i, email: 'api' + i + '@test.com' };
            const regalo = { 
                email: 'api' + i + '@test.com', 
                nombre_regalo: 'Nintendo Switch ' + i, 
                url_regalo: 'http://foto.com',
                precio: 45000 
            }        
            const responseUsuario = await request(app)
            .post('/registrar')
            .send(usuario);

            const responseRegalo = await request(app)
                .post('/regalo')
                .send(regalo);

            expect(responseUsuario.statusCode).toBe(201);
            expect(responseUsuario.headers['content-type']).toMatch(/json/);
            expect(responseUsuario.body).toHaveProperty('id');
            expect(responseUsuario.body.email).toBe('api' + i + '@test.com');

            expect(responseRegalo.statusCode).toBe(201);
            expect(responseRegalo.headers['content-type']).toMatch(/json/);
            expect(responseRegalo.body).toHaveProperty('id');
            expect(responseRegalo.body.nombre_regalo).toBe('Nintendo Switch ' + i);
            expect(responseRegalo.body.miembro_id).toBe(responseUsuario.body.id);
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