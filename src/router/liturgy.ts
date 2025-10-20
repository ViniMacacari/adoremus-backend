import { Router } from 'express'
import { LiturgicalCalendarController } from '../controllers/liturgy/calendar.js'
import { GospelLiturgyController } from '../controllers/liturgy/gospel.js'
import { GetBreviaryController } from '../controllers/breviary/get-day-breviary.js'

export class LiturgyRouter {
    public readonly router: Router

    private liturgicalCalendar: LiturgicalCalendarController = new LiturgicalCalendarController()
    private gospelLiturgy: GospelLiturgyController = new GospelLiturgyController()
    private breviaryController: GetBreviaryController = new GetBreviaryController()

    constructor() {
        this.router = Router()
        this.setupRoutes()
    }

    private setupRoutes(): void {
        this.router.get('/calendario/hoje', this.liturgicalCalendar.getToday.bind(this.liturgicalCalendar))
        this.router.get('/calendario/:year/:month?', this.liturgicalCalendar.get.bind(this.liturgicalCalendar))
        this.router.get('/evangelho', this.gospelLiturgy.get.bind(this.gospelLiturgy))
        this.router.get('/das-horas/:year/:month/:day', this.breviaryController.get.bind(this.breviaryController))
    }
}