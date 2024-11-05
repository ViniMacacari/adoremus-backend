import express, { Application } from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import path from 'path'
import rateLimit from 'express-rate-limit'

import RotaBuscarSantoTerco from './routes/santo-terco/buscar.js'
import RotaBuscar from './routes/api/buscar.js'

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
        const limiter = rateLimit({
            windowMs: 1 * 60 * 1000,
            max: 10,
            message: { error: 'Muitas requisições. Tente novamente mais tarde.' }
        })

        this.app.use(limiter)
        this.app.use(express.json())
        this.app.use(express.static(path.join(__dirname, 'public')))
        this.app.use(cors())
    }

    private rotas(): void {
        this.app.use('/api/buscar', RotaBuscar)
        this.app.use('/santo-terco', RotaBuscarSantoTerco)
        this.app.get('/', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'Adoremus.html')) })
    }

    public iniciar(): void {
        this.app.listen(this.porta, () => {
            console.log(`Servidor iniciado na porta ${this.porta}`)
        })
    }
}

new Servidor().iniciar()