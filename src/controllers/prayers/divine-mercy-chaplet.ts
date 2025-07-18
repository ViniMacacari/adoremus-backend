import { Request, Response } from "express"
import { DivineMercyChapletService } from "../../services/prayers/divine-mercy-chaplet.js"

export class DivineMercyChapletController {
    private service: DivineMercyChapletService = new DivineMercyChapletService()

    async get(_req: Request, res: Response): Promise<void> {
        try {
            const result = await this.service.get()
            res.status(200).json({
                paginas: 1,
                totalPaginas: 1,
                dados: result
            })
        } catch (error: any) {
            console.error(`Error fetching love rosary mysteries: ${error.message}`)
            res.status(500).json({ error: 'Failed to fetch love rosary mysteries' })
        }
    }
}