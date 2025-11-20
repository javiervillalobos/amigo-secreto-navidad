export class SorteoService {
    constructor(dbPool, emailClient) {
        this.db = dbPool;
        this.email = emailClient;
        this.P1 = 20000;
        this.P2 = 50000;
    }

    async registrarMiembro({ nombre, email }) {
        if (!nombre) {
            throw new Error('El nombre es requerido');
        }

        if (!email) {
            throw new Error('El email es requerido');
        }    
        
        try {
            const result = await this.db.query(
                'INSERT INTO Familia (nombre, email) VALUES ($1, $2) RETURNING *',
                [nombre, email]
            );
            return result.rows[0];
        } catch (error) {
            // Código de error Postgres para Unique Violation es '23505'
            if (error.code === '23505') {
                throw new Error('El email ya está registrado');
            }
            throw error; // Relanzar otros errores inesperados
        }
    }

    async guardarRegalo({ email, nombre_regalo, url_regalo, precio }) {
        const precioNumerico = Number(precio);

        if (precioNumerico < this.P1) {
            throw new Error(`El precio debe ser mayor a $${this.P1}`);
        }
        
        if (precioNumerico > this.P2) {
            throw new Error(`El precio debe ser menor a $${this.P2}`);
        }

        const miembro = await this.db.query('SELECT id FROM Familia WHERE email = $1', [email]);
        
        if (miembro.rows.length === 0) {
            throw new Error('Email no encontrado');
        }        

        const miembro_id = miembro.rows[0].id;

        const result = await this.db.query(
            `INSERT INTO Regalos (miembro_id, nombre_regalo, url_regalo, precio) 
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (miembro_id) 
             DO UPDATE SET nombre_regalo = $2, url_regalo = $3, precio = $4
             RETURNING *`,
            [miembro_id, nombre_regalo, url_regalo, precioNumerico]
        );

        return result.rows[0];

    }    

    async realizarSorteo() {
        const query = `
            SELECT f.id as miembro_id, f.nombre as miembro_nombre, f.email as miembro_email, 
                   r.nombre_regalo, r.url_regalo, r.precio
            FROM Familia f
            JOIN Regalos r ON f.id = r.miembro_id
        `;
        const { rows: participantes } = await this.db.query(query);

        if (participantes.length < 2) {
            throw new Error('Se necesitan al menos 2 participantes con regalo para realizar el sorteo');
        }

        let compradores = [...participantes];
        let receptores = [...participantes];
        let asignaciones = [];
        let sorteoValido = false;

        while (!sorteoValido) {
            receptores.sort(() => Math.random() - 0.5);
            
            sorteoValido = true;
            asignaciones = [];

            for (let i = 0; i < compradores.length; i++) {
                if (compradores[i].miembro_id === receptores[i].miembro_id) {
                    sorteoValido = false; 
                    break; 
                }
                asignaciones.push({
                    comprador: compradores[i],
                    receptor: receptores[i]
                });
            }
        }

        const promesasEmail = asignaciones.map(match => {
            return this._enviarEmail(match.comprador, match.receptor);
        });

        await Promise.all(promesasEmail);

        const detalles = [];
        for (const match of asignaciones) {
            detalles.push({
                nombrePersona: match.comprador.miembro_nombre,
                regaloPropio: match.comprador.nombre_regalo,
                regaloAsignado: match.receptor.nombre_regalo
            });
        }   
        
        return { 
            mensaje: `Sorteo realizado. Se enviaron ${asignaciones.length} correos.`,
            detalle: detalles
        };
    }

    async _enviarEmail(comprador, receptor) {
        const { miembro_nombre, miembro_email } = comprador;
        const { miembro_nombre: receptor_nombre, nombre_regalo, url_regalo, precio } = receptor;
        
        // Validación de seguridad: Si no hay cliente de correo (ej: testing sin mock), no romper
        if (!this.email) return;

        const fromEmail = process.env.GMAIL_USER || 'noreply@amigosecreto.cl'; 

        const htmlBody = `
            <h1>Hola ${miembro_nombre} 🎄</h1>
            <p>Te tocó regalarle a: <strong>${receptor_nombre}</strong></p>
            <p>Desea: ${nombre_regalo} (Aprox $${precio})</p>
            <p>Link: ${url_regalo || 'Sin link'}</p>
        `;

        await this.email.sendMail({
            from: `Amigo Secreto <${fromEmail}>`,
            to: miembro_email,
            subject: '🎄 Tu Amigo Secreto es...',
            html: htmlBody
        });
    }
}