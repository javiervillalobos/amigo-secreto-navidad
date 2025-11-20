import { expect, jest } from '@jest/globals';
import pool from '../src/config/db.js';
import { resetDatabase, closeDatabase } from './test_helper.js';
import { SorteoService } from '../src/services/SorteoService.js';

describe('SorteoService', () => {
    let service;
    let mockEmailClient;
    let mockWhatsAppService;

    afterAll(async () => {
        await closeDatabase();
    });

    beforeEach(async () => {
        await resetDatabase();
        mockEmailClient = { sendMail: jest.fn() };
        mockWhatsAppService = { enviarMensaje: jest.fn() };
        service = new SorteoService(pool, mockEmailClient, mockWhatsAppService);
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


    test('Debe realizar el sorteo correctamente y recibir detalle de las asignaciones', async () => {
        const correos = ['a@fam.cl', 'b@fam.cl', 'c@fam.cl'];
        const regalos = ['Regalo a@fam.cl', 'Regalo b@fam.cl', 'Regalo c@fam.cl'];
        
        for (const email of correos) {
            await service.registrarMiembro({ nombre: 'User ' + email, email });
            await service.guardarRegalo({ email, nombre_regalo: 'Regalo ' + email, precio: 30000 });
        }

        const resultado = await service.realizarSorteo();

        expect(resultado).toHaveProperty('mensaje');
        expect(resultado).toHaveProperty('detalle');
        expect(resultado.mensaje).toContain('Sorteo realizado');        
        expect(service.email.sendMail).toHaveBeenCalledTimes(3);
        expect(resultado.detalle).toHaveLength(3);

        const regalosAsignados = new Map();

        for (const detalle of resultado.detalle) {
            const regaloPropio = detalle.regaloPropio;
            const regaloAsignado = detalle.regaloAsignado

            expect(regaloAsignado).not.toBe(regaloPropio);

            let contador = regalosAsignados.get(regaloAsignado) || 0;
            contador++;
            regalosAsignados.set(regaloAsignado, contador);
        }

        expect(regalosAsignados.size).toBe(3);

        for (const [regalo, contador] of regalosAsignados) {
            expect(contador).toBe(1);
        }
    
    });

    test('Debe realizar el sorteo correctamente para 5 personas y recibir detalle de las asignaciones', async () => {
        const correos = ['a@fam.cl', 'b@fam.cl', 'c@fam.cl', 'd@fam.cl', 'e@fam.cl'];
        const regalos = ['Regalo a@fam.cl', 'Regalo b@fam.cl', 'Regalo c@fam.cl', 'Regalo d@fam.cl', 'Regalo e@fam.cl'];
        
        for (const email of correos) {
            await service.registrarMiembro({ nombre: 'User ' + email, email });
            await service.guardarRegalo({ email, nombre_regalo: 'Regalo ' + email, precio: 30000 });
        }

        const resultado = await service.realizarSorteo();

        expect(resultado).toHaveProperty('mensaje');
        expect(resultado).toHaveProperty('detalle');
        expect(resultado.mensaje).toContain('Sorteo realizado');        
        expect(service.email.sendMail).toHaveBeenCalledTimes(5);
        expect(resultado.detalle).toHaveLength(5);

        const regalosAsignados = new Map();

        for (const detalle of resultado.detalle) {
            const regaloPropio = detalle.regaloPropio;
            const regaloAsignado = detalle.regaloAsignado

            expect(regaloAsignado).not.toBe(regaloPropio);

            let contador = regalosAsignados.get(regaloAsignado) || 0;
            contador++;
            regalosAsignados.set(regaloAsignado, contador);
        }

        expect(regalosAsignados.size).toBe(5);

        for (const [regalo, contador] of regalosAsignados) {
            expect(contador).toBe(1);
        }
    
    });

    test('Debe intentar enviar WhatsApp si el usuario tiene teléfono', async () => {
        // 1. Crear usuarios, uno con teléfono y otro sin
        const u1 = await service.registrarMiembro({ nombre: 'Ana', email: 'ana@test.com', telefono: '+56911111111' });
        const u2 = await service.registrarMiembro({ nombre: 'Beto', email: 'beto@test.com' }); // Sin teléfono

        await service.guardarRegalo({ email: 'ana@test.com', nombre_regalo: 'R1', precio: 25000 });
        await service.guardarRegalo({ email: 'beto@test.com', nombre_regalo: 'R2', precio: 25000 });

        // 2. Realizar Sorteo
        await service.realizarSorteo();

        // 3. Validaciones
        // El email siempre se envía
        expect(mockEmailClient.sendMail).toHaveBeenCalledTimes(2);
        
        // El WhatsApp solo se envía a Ana (que tiene teléfono)
        expect(mockWhatsAppService.enviarMensaje).toHaveBeenCalledTimes(1);
        expect(mockWhatsAppService.enviarMensaje).toHaveBeenCalledWith(
            '+56911111111', 
            expect.stringContaining('tu Amigo Secreto es') // El mensaje debe tener el texto clave
        );
    });    
});