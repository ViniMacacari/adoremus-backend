import { Router } from 'express'
import { OrdinaryRiteMissalController } from '../controllers/missal/ordinary-rite.js'

export class MissalRouter {
    public readonly router: Router

    private ordinary: OrdinaryRiteMissalController = new OrdinaryRiteMissalController()

    constructor() {
        this.router = Router()
        this.setupRoutes()
    }

    private setupRoutes(): void {
        this.router.get('/ordinario', this.ordinary.get.bind(this.ordinary))
    }
}