import { Router } from 'express'
import { LoveChapletController } from '../controllers/prayers/love-chaplet.js'

export class PrayersRouter {
    public readonly router: Router

    private loveChaplet: LoveChapletController = new LoveChapletController()

    constructor() {
        this.router = Router()
        this.setupRoutes()
    }

    private setupRoutes(): void {
        this.router.get('/terco-amor', this.loveChaplet.get.bind(this.loveChaplet))
    }
}