import { Router } from 'express'
import { RosaryMysteriesController } from '../controllers/rosary/rosary-mysteries.js'

export class RosaryRouter {
    public readonly router: Router

    private rosaryMysteries: RosaryMysteriesController = new RosaryMysteriesController()

    constructor() {
        this.router = Router()
        this.setupRoutes()
    }

    private setupRoutes(): void {
        this.router.get('/mysteries', this.rosaryMysteries.get.bind(this.rosaryMysteries))
    }
}