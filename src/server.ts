import express, { Application } from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import rateLimit from 'express-rate-limit'

import { RosaryRouter } from './router/rosary.js'
import { LiturgyRouter } from './router/liturgy.js'
import { PrayersRouter } from './router/prayers.js'
import { PeopleRouter } from './router/saints.js'
import { DoutrineRouter } from './router/doutrine.js'
import { LectioDivinaRouter } from './router/lectio-divina.js'

import { LiturgyScheduler } from './cron/liturgy.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

class Server {
    private app: Application
    private port: number

    private rosaryRouter: RosaryRouter = new RosaryRouter()
    private liturgyRouter: LiturgyRouter = new LiturgyRouter()
    private prayersRouter: PrayersRouter = new PrayersRouter()
    private peopleRouter: PeopleRouter = new PeopleRouter()
    private doutrineRouter: DoutrineRouter = new DoutrineRouter()
    private lectioDivinaRouter: LectioDivinaRouter = new LectioDivinaRouter()

    private liturgyScheduler: LiturgyScheduler = new LiturgyScheduler()

    constructor() {
        this.app = express()
        this.port = Number(process.env.SERVER_PORT)
        this.setupMiddlewares()
        this.setupRoutes()
    }

    private setupMiddlewares(): void {
        this.app.use(cors())

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
    }

    private setupRoutes(): void {
        this.app.use('/rosario', this.rosaryRouter.router)
        this.app.use('/liturgia', this.liturgyRouter.router)
        this.app.use('/oracoes', this.prayersRouter.router)
        this.app.use('/pessoas', this.peopleRouter.router)
        this.app.use('/doutrina', this.doutrineRouter.router)
        this.app.use('/lectio-divina', this.lectioDivinaRouter.router)
    }

    public start(): void {
        this.app.listen(this.port, () => {
            console.log(`Server started on port ${this.port}`)
            this.liturgyScheduler.runNow()
        })

        this.liturgyScheduler.start()
    }
}

new Server().start()