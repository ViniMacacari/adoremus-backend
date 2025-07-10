import { Router } from 'express'
import { LoveChapletController } from '../controllers/prayers/love-chaplet.js'
import { DivineMercyChapletController } from '../controllers/prayers/divine-mercy-chaplet.js'
import { AllPrayersController } from '../controllers/prayers/all-prayers.js'

export class PrayersRouter {
    public readonly router: Router

    private loveChaplet: LoveChapletController = new LoveChapletController()
    private divineMercyChaplet: DivineMercyChapletController = new DivineMercyChapletController()
    private allPrayers: AllPrayersController = new AllPrayersController()

    constructor() {
        this.router = Router()
        this.setupRoutes()
    }

    private setupRoutes(): void {
        this.router.get('/terco-amor', this.loveChaplet.get.bind(this.loveChaplet))
        this.router.get('/terco-misericordia', this.divineMercyChaplet.get.bind(this.divineMercyChaplet))
        this.router.get('/todas', this.allPrayers.get.bind(this.allPrayers))
    }
}