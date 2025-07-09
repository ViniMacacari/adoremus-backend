import { Router } from 'express'
import { CommandmentsController } from '../controllers/commandments/commandments.js'

export class DoutrineRouter {
    public readonly router: Router

    private commandments: CommandmentsController = new CommandmentsController()

    constructor() {
        this.router = Router()
        this.setupRoutes()
    }

    private setupRoutes(): void {
        this.router.get('/mandamentos', this.commandments.get.bind(this.commandments))
    }
}