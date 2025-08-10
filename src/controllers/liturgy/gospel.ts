import { Request, Response } from "express"
import { GospelLiturgyService } from "../../services/liturgy/gospel.js"

export class GospelLiturgyController {
    private service: GospelLiturgyService = new GospelLiturgyService()

    async get(req: Request, res: Response): Promise<void> {
        try {
            const { locale } = req.query
            const result = await this.service.getToday(locale as string | undefined)
            res.status(200).json({
                paginas: 1,
                totalPaginas: 1,
                dados: result
            })
        } catch (error: any) {
            console.error(`Error fetching liturgy gospel: ${error.message}`)
            res.status(500).json({ error: 'Failed to fetch liturgy gospel' })
        }
    }
}