import { Router } from 'express'
import { SaintsController } from '../controllers/people/get-saints.js'

export class PeopleRouter {
    public readonly router: Router

    private saints: SaintsController = new SaintsController()

    constructor() {
        this.router = Router()
        this.setupRoutes()
    }

    private setupRoutes(): void {
        this.router.get('/santos', this.saints.get.bind(this.saints))
    }
}