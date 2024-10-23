import { Router } from 'express'

import TercoMariano from '../../controllers/santo-terco/tercos/terco-mariano'

import OracoesTerco from '../../controllers/santo-terco/oracoes/oracoes-terco'

class RotaBuscarSantoTerco {
    public router: Router

    constructor() {
        this.router = Router()
        this.registrarRotas()
    }

    private registrarRotas(): void {
        this.router.get('/buscar/terco/mariano', (req, res) => TercoMariano.informacoes(req, res))
        this.router.get('/buscar/oracoes/terco', (req, res) => OracoesTerco.informacoes(req, res))
    }
}

export default new RotaBuscarSantoTerco().router