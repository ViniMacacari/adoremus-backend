import { Router } from 'express'

import ControllerSantos from '../../controllers/adoremus/santos/santos'
import ControllerCalendarioLiturgico from '../../controllers/adoremus/calendario/liturgico'

class RotaBuscar {
    public router: Router

    constructor() {
        this.router = Router()
        this.registrarRotas()
    }

    private registrarRotas(): void {
        this.router.get('/santos', (req, res) => ControllerSantos.informacoes(req, res))
        this.router.get('/calendario-liturgico', (req, res) => ControllerCalendarioLiturgico.informacoes(req, res))
    }
}

export default new RotaBuscar().router