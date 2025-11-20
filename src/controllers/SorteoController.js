export class SorteoController {
    
    constructor(sorteoService) {
        this.service = sorteoService;
        // Bind para no perder el contexto 'this' al pasarlo a Express
        this.registrar = this.registrar.bind(this);
        this.guardarRegalo = this.guardarRegalo.bind(this); // Nuevo
        this.realizarSorteo = this.realizarSorteo.bind(this); // Nuevo
    }    

    async registrar(req, res) {
        try {
            // req.body trae los datos del JSON enviado
            const resultado = await this.service.registrarMiembro(req.body);
            res.status(201).json(resultado);
        } catch (error) {
            // Manejo simple de errores HTTP
            if (error.message.includes('requerido') || error.message.includes('registrado')) {
                res.status(400).json({ error: error.message }); // Bad Request
            } else {
                console.error(error);
                res.status(500).json({ error: 'Error interno del servidor' });
            }
        }
    }

    async guardarRegalo(req, res) {
        try {
            const resultado = await this.service.guardarRegalo(req.body);
            res.status(201).json(resultado);
        } catch (error) {
            if (error.message.includes('precio') || error.message.includes('encontrado')) {
                res.status(400).json({ error: error.message });
            } else {
                console.error(error);
                res.status(500).json({ error: 'Error al guardar regalo' });
            }
        }
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
    }}