import { Request, Response } from "express"
import { GetBreviaryService } from "../../services/breviary/get-day-breviary.js"

export class GetBreviaryController {
    private service: GetBreviaryService = new GetBreviaryService()

    async get(req: Request, res: Response): Promise<void> {
        try {
            if (!req.params.day || !req.params.month || !req.params.year) {
                res.status(400).json({ error: 'Missing required parameters: day, month, year' })
                return
            }

            const language = req.query.lang as string | undefined

            const result = await this.service.get(Number(req.params.day), Number(req.params.month), Number(req.params.year), language)
            res.status(200).json({
                paginas: 1,
                totalPaginas: 1,
                dados: result
            })
        } catch (error: any) {
            console.error(`Error fetching breviary: ${error.message}`)
            res.status(500).json({ error: 'Failed to fetch commandments' })
        }
    }
}