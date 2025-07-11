import { Router } from 'express'
import { LectioDivinaAllController } from '../controllers/lectio-divina/get-all-meditations.js'
import { LectioDivinaController } from '../controllers/lectio-divina/get-meditation.js'

export class LectioDivinaRouter {
    public readonly router: Router

    private lectioDivinaAll: LectioDivinaAllController = new LectioDivinaAllController()
    private lectioDivina: LectioDivinaController = new LectioDivinaController()

    constructor() {
        this.router = Router()
        this.setupRoutes()
    }

    private setupRoutes(): void {
        this.router.get('/datas', this.lectioDivinaAll.get.bind(this.lectioDivinaAll))
        this.router.get('/:id', this.lectioDivina.get.bind(this.lectioDivina))
    }
}