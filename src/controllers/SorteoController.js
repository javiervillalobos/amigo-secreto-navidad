export class SorteoController {
    
    constructor(sorteoService) {
        this.service = sorteoService;
        this.realizarSorteo = this.realizarSorteo.bind(this); // Nuevo
        this.unirse = this.unirse.bind(this);
    }    

    // Método nuevo
    async realizarSorteo(req, res) {
        try {
            const resultado = await this.service.realizarSorteo();
            res.status(200).json(resultado);
        } catch (error) {
            if (error.message.includes('participantes')) {
                res.status(400).json({ error: error.message });
            } else {
                console.error(error);
                res.status(500).json({ error: 'Error en el sorteo' });
            }
        }
    }

    async unirse(req, res) {
        try {
            const resultado = await this.service.inscribirParticipante(req.body);
            res.status(201).json(resultado);
        } catch (error) {
            // Reutilizamos lógica de error simple
            if (error.message.includes('requerido') || error.message.includes('precio') || error.message.includes('registrado')) {
                res.status(400).json({ error: error.message });
            } else {
                console.error(error);
                res.status(500).json({ error: 'Error al unirse al sorteo' });
            }
        }
    }
}