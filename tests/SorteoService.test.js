import { jest } from '@jest/globals';
import pool from '../src/config/db.js';
import { resetDatabase, closeDatabase } from './test_helper.js';
import { SorteoService } from '../src/services/SorteoService.js';

describe('SorteoService', () => {
    let service;

    afterAll(async () => {
        await closeDatabase();
    });

    beforeEach(async () => {
        await resetDatabase();
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
        
        await service.registrarMiembro(datos);

        await expect(service.registrarMiembro(datos))
            .rejects
            .toThrow('El email ya está registrado');
    });

    test('Debe fallar si el precio del regalo es menor al mínimo ($20.000)', async () => {
        const regaloBarato = { 
            email: 'tacaño@familia.cl', 
            nombre_regalo: 'Calcetines', 
            precio: 5000
        };
        
        await expect(service.guardarRegalo(regaloBarato))
            .rejects
            .toThrow('El precio debe ser mayor a $20000');
    });

    test('Debe fallar si el precio del regalo supera el máximo ($50.000)', async () => {
        const regaloCaro = { 
            email: 'millonario@familia.cl', 
            nombre_regalo: 'PlayStation 5', 
            precio: 500000
        };
        
        await expect(service.guardarRegalo(regaloCaro))
            .rejects
            .toThrow('El precio debe ser menor a $50000');
    });

    test('Debe fallar si el email del usuario no existe en la base de datos', async () => {
        const regaloHuerfano = { 
            email: 'fantasma@familia.cl', 
            nombre_regalo: 'Bicicleta', 
            precio: 30000 
        };
        
        await expect(service.guardarRegalo(regaloHuerfano))
            .rejects
            .toThrow('Email no encontrado');
    });    

    test('Debe guardar (o actualizar) el regalo correctamente', async () => {
        const usuario = await service.registrarMiembro({ nombre: 'Hijo 1', email: 'hijo1@familia.cl' });
        
        const regalo = { 
            email: 'hijo1@familia.cl', 
            nombre_regalo: 'Nintendo Switch', 
            url_regalo: 'http://foto.com',
            precio: 45000 
        };

        const resultado = await service.guardarRegalo(regalo);

        expect(resultado).toHaveProperty('id');
        expect(resultado.nombre_regalo).toBe('Nintendo Switch');
        expect(resultado.miembro_id).toBe(usuario.id); 
    });

    test('Debe fallar el sorteo si hay menos de 2 participantes con regalo', async () => {
        await expect(service.realizarSorteo())
            .rejects
            .toThrow('Se necesitan al menos 2 participantes');

        const u1 = await service.registrarMiembro({ nombre: 'Solo', email: 'solo@familia.cl' });
        await service.guardarRegalo({ email: 'solo@familia.cl', nombre_regalo: 'Algo', precio: 25000 });

        await expect(service.realizarSorteo())
            .rejects
            .toThrow('Se necesitan al menos 2 participantes');
    });

    test('Debe realizar el sorteo correctamente y enviar correos', async () => {
        const correos = ['a@fam.cl', 'b@fam.cl', 'c@fam.cl'];
        
        for (const email of correos) {
            await service.registrarMiembro({ nombre: 'User ' + email, email });
            await service.guardarRegalo({ email, nombre_regalo: 'Regalo', precio: 30000 });
        }

        const resultado = await service.realizarSorteo();

        expect(resultado.mensaje).toContain('Sorteo realizado');
        
        expect(service.email.sendMail).toHaveBeenCalledTimes(3);
    });

});