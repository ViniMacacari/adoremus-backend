import express, { Application } from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import path from 'path'
import rateLimit from 'express-rate-limit'

import { RosaryRouter } from './router/rosary.js'
import { LiturgyRouter } from './router/liturgy.js'
import { PrayersRouter } from './router/prayers.js'

dotenv.config()

class Server {
    private app: Application
    private port: number

    private rosaryRouter: RosaryRouter = new RosaryRouter()
    private liturgyRouter: LiturgyRouter = new LiturgyRouter()
    private prayersRouter: PrayersRouter = new PrayersRouter()

    constructor() {
        this.app = express()
        this.port = Number(process.env.SERVER_PORT)
        this.setupMiddlewares()
        this.setupRoutes()
    }

    private setupMiddlewares(): void {
        const limiter = rateLimit({
            windowMs: 1 * 60 * 1000,
            max: 100,
            keyGenerator: (req: any) => req.ip,
            message: { error: 'Too many requests. Please try again later.' }
        })

        this.app.use(limiter)
        this.app.use(express.json())
        this.app.use(express.static(path.join(__dirname, 'public')))
        this.app.use('/img', express.static(path.join(__dirname, 'public', 'img')))
        this.app.use(cors())
    }

    private setupRoutes(): void {
        this.app.use('/rosario', this.rosaryRouter.router)
        this.app.use('/liturgia', this.liturgyRouter.router)
        this.app.use('/oracoes', this.prayersRouter.router)
    }

    public start(): void {
        this.app.listen(this.port, () => {
            console.log(`Server started on port ${this.port}`)
        })
    }
}

new Server().start()