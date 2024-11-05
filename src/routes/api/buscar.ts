import { Router } from 'express'

import ControllerSantos from '../../controllers/adoremus/santos/santos'

class RotaBuscar {
    public router: Router

    constructor() {
        this.router = Router()
        this.registrarRotas()
    }

    private registrarRotas(): void {
        this.router.get('/santos', (req, res) => ControllerSantos.informacoes(req, res))
    }
}

export default new RotaBuscar().router