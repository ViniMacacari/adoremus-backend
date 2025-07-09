import { Router } from 'express'
import { LiturgicalCalendarController } from '../controllers/liturgy/calendar'
import { GospelLiturgyController } from '../controllers/liturgy/gospel'

export class LiturgyRouter {
    public readonly router: Router

    private liturgicalCalendar: LiturgicalCalendarController = new LiturgicalCalendarController()
    private gospelLiturgy: GospelLiturgyController = new GospelLiturgyController()

    constructor() {
        this.router = Router()
        this.setupRoutes()
    }

    private setupRoutes(): void {
        this.router.get('/calendario/:year/:month?', this.liturgicalCalendar.get.bind(this.liturgicalCalendar))
        this.router.get('/evangelho', this.gospelLiturgy.get.bind(this.gospelLiturgy))
    }
}