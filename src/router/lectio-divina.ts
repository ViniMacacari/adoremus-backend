import { Router } from 'express'
import { LectioDivinaAllController } from '../controllers/lectio-divina/get-all-meditations.js'

export class LectioDivinaRouter {
    public readonly router: Router

    private lectioDivinaAll: LectioDivinaAllController = new LectioDivinaAllController()

    constructor() {
        this.router = Router()
        this.setupRoutes()
    }

    private setupRoutes(): void {
        this.router.get('/datas', this.lectioDivinaAll.get.bind(this.lectioDivinaAll))
    }
}