import { Router } from 'express'

import ControllerSantos from '../../controllers/adoremus/santos/santos'
import ControllerCalendarioLiturgico from '../../controllers/adoremus/calendario/liturgico'
import ControllerMandamentos from '../../controllers/adoremus/ensinamentos/mandamentos'
import ControllerPostagens from '../../controllers/adoremus/ensinamentos/postagens'

class RotaBuscar {
    public router: Router

    constructor() {
        this.router = Router()
        this.registrarRotas()
        this.registrarRotasEnsinamentos()
        this.registrarRotasPostagens()
    }

    private registrarRotas(): void {
        this.router.get('/santos', (req, res) => ControllerSantos.informacoes(req, res))
        this.router.get('/calendario-liturgico', (req, res) => ControllerCalendarioLiturgico.informacoes(req, res))
    }

    private registrarRotasEnsinamentos(): void {
        this.router.get('/ensinamentos/mandamentos', (req, res) => ControllerMandamentos.informacoes(req, res))
    }

    private registrarRotasPostagens(): void {
        this.router.get('/postagens', (req, res) => ControllerPostagens.informacoes(req, res))
    }
}

export default new RotaBuscar().router