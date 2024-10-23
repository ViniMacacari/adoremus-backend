import { Router } from 'express'

import TercoMariano from '../../controllers/santo-terco/tercos/terco-mariano'

import OracoesTerco from '../../controllers/santo-terco/oracoes/oracoes-terco'
import OracoesTercoMisericordia from '../../controllers/santo-terco/oracoes/terco-misericordia'

class RotaBuscarSantoTerco {
    public router: Router

    constructor() {
        this.router = Router()
        this.registrarRotas()
    }

    private registrarRotas(): void {
        this.router.get('/buscar/terco/mariano', (req, res) => TercoMariano.informacoes(req, res))
        this.router.get('/buscar/oracoes/terco', (req, res) => OracoesTerco.informacoes(req, res))
        this.router.get('/buscar/oracoes/terco-misericordia', (req, res) => OracoesTercoMisericordia.informacoes(req, res))
    }
}

export default new RotaBuscarSantoTerco().router