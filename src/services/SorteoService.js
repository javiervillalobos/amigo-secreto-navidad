export class SorteoService {
    constructor(dbPool, emailClient) {
        this.db = dbPool;
        this.email = emailClient;
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
}