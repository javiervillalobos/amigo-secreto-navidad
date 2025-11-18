import { jest } from '@jest/globals';
import pool from '../src/config/db.js';
import { resetDatabase, closeDatabase } from './test_helper.js';
import { SorteoService } from '../src/services/SorteoService.js';

describe('SorteoService', () => {
    let service;

    beforeAll(async () => {
        await resetDatabase();
    });

    afterAll(async () => {
        await closeDatabase();
    });

    beforeEach(() => {
        const mockEmailClient = { sendMail: jest.fn() };
        service = new SorteoService(pool, mockEmailClient);
    });

    test('Debe fallar si no se proporciona un nombre', async () => {
        const datosSinNombre = { email: 'anonimo@familia.cl' };
        
        await expect(service.registrarMiembro(datosSinNombre))
            .rejects
            .toThrow('El nombre es requerido');
    });    

    test('Debe fallar si no se proporciona un email', async () => {
        const datosSinEmail = { nombre: 'Tío Sin Mail' };
        
        await expect(service.registrarMiembro(datosSinEmail))
            .rejects
            .toThrow('El email es requerido');
    });

    test('Debe registrar un miembro correctamente cuando los datos son válidos', async () => {
        const datos = { nombre: 'Abuela Rosa', email: 'rosa@familia.cl' };
        
        const resultado = await service.registrarMiembro(datos);

        expect(resultado).toHaveProperty('id');
        expect(resultado.nombre).toBe('Abuela Rosa');
        expect(resultado.email).toBe('rosa@familia.cl');
    });

    test('Debe fallar si se intenta registrar un email duplicado', async () => {
        const datos = { nombre: 'Primo Juan', email: 'juan@familia.cl' };
        
        // Primer registro: Éxito
        await service.registrarMiembro(datos);

        // Segundo registro: Debe fallar
        await expect(service.registrarMiembro(datos))
            .rejects
            .toThrow('El email ya está registrado');
    });
});