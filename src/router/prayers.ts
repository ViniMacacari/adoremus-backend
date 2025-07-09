import { Router } from 'express'
import { LoveRosaryController } from '../controllers/prayers/love-chaplet.js'

export class PrayersRouter {
    public readonly router: Router

    private loveRosary: LoveRosaryController = new LoveRosaryController()

    constructor() {
        this.router = Router()
        this.setupRoutes()
    }

    private setupRoutes(): void {
        this.router.get('/terco-amor', this.loveRosary.get.bind(this.loveRosary))
    }
}