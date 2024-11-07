import { Router } from 'express'

import ControllerSantos from '../../controllers/adoremus/santos/santos'
import ControllerCalendarioLiturgico from '../../controllers/adoremus/calendario/liturgico'
import ControllerMandamentos from '../../controllers/adoremus/ensinamentos/mandamentos'

class RotaBuscar {
    public router: Router

    constructor() {
        this.router = Router()
        this.registrarRotas()
        this.registrarRotasEnsinamentos()
    }

    private registrarRotas(): void {
        this.router.get('/santos', (req, res) => ControllerSantos.informacoes(req, res))
        this.router.get('/calendario-liturgico', (req, res) => ControllerCalendarioLiturgico.informacoes(req, res))
    }

    private registrarRotasEnsinamentos(): void {
        this.router.get('/ensinamentos/mandamentos', (req, res) => ControllerMandamentos.informacoes(req, res))
    }
}

export default new RotaBuscar().router