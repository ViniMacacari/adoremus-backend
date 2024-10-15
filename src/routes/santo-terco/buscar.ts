import { Router } from 'express'
import TercoMariano from '../../controllers/santo-terco/tercos/terco-mariano'

class RotaBuscarSantoTerco {
    public router: Router

    constructor() {
        this.router = Router()
        this.registrarRotas()
    }

    private registrarRotas(): void {
        this.router.get('/buscar/santo-terco', (req, res) => TercoMariano.informacoes(req, res))
    }
}

export default new RotaBuscarSantoTerco().router