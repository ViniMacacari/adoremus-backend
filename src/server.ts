import express, { Application } from 'express'
import dotenv from 'dotenv'

import RotaBuscarSantoTerco from './routes/santo-terco/buscar.js'

dotenv.config()

class Servidor {
    private app: Application
    private porta: number

    constructor() {
        this.app = express()
        this.porta = Number(process.env.PORTA_SERVIDOR)
        this.middlewares()
        this.rotas()
    }

    private middlewares(): void {
        this.app.use(express.json())
    }

    private rotas(): void {
        this.app.use('/santo-terco', RotaBuscarSantoTerco)
    }

    public iniciar(): void {
        this.app.listen(this.porta, () => {
            console.log(`Servidor iniciado na porta ${this.porta}`)
        })
    }
}

new Servidor().iniciar()