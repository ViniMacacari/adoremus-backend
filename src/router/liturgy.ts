import { Router } from 'express'
import { LiturgicalCalendarController } from '../controllers/liturgy/calendar'

export class LiturgyRouter {
    public readonly router: Router

    private liturgicalCalendar: LiturgicalCalendarController = new LiturgicalCalendarController()

    constructor() {
        this.router = Router()
        this.setupRoutes()
    }

    private setupRoutes(): void {
        this.router.get('/calendario/:year/:month?', this.liturgicalCalendar.get.bind(this.liturgicalCalendar))
    }
}