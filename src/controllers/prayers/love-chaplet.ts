import { Request, Response } from "express"
import { LoveChapletService } from "../../services/prayers/love-chaplet"

export class LoveChapletController {
    private service: LoveChapletService = new LoveChapletService()

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