import { Router } from 'express'
import { LoveChapletController } from '../controllers/prayers/love-chaplet.js'
import { DivineMercyChapletController } from '../controllers/prayers/divine-mercy-chaplet.js'

export class PrayersRouter {
    public readonly router: Router

    private loveChaplet: LoveChapletController = new LoveChapletController()
    private divineMercyChaplet: DivineMercyChapletController = new DivineMercyChapletController()

    constructor() {
        this.router = Router()
        this.setupRoutes()
    }

    private setupRoutes(): void {
        this.router.get('/terco-amor', this.loveChaplet.get.bind(this.loveChaplet))
        this.router.get('/terco-misericordia', this.divineMercyChaplet.get.bind(this.divineMercyChaplet))
    }
}