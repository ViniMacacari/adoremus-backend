import { Request, Response } from "express"
import { LiturgicalCalendarService } from "../../services/liturgy/calendar"

export class LiturgicalCalendarController {
    private service: LiturgicalCalendarService = new LiturgicalCalendarService()

    async get(req: Request, res: Response): Promise<void> {
        const year: number = Number(req.params.year)
        const month: number = Number(req.params.month)

        if (!year) {
            res.status(400).json({ error: 'Invalid year parameter' })
            return
        }

        try {
            const result = month
                ? await this.service.getMonthLiturgicalDays(year, month)
                : await this.service.getYearLiturgicalDays(year)
            res.status(200).json(result)
        } catch (error: any) {
            console.error(`Error fetching liturgical days: ${error.message}`)
            res.status(500).json({ error: 'Failed to fetch liturgical days' })
        }
    }
}