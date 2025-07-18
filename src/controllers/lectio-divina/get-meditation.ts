import { Request, Response } from "express"
import { LectioDivinaService } from "../../services/lectio-divina/get-meditation.js"

export class LectioDivinaController {
    private service: LectioDivinaService = new LectioDivinaService()

    async get(req: Request, res: Response): Promise<void> {
        try {
            const result = await this.service.get(req.params.id ? parseInt(req.params.id) : 0)
            res.status(200).json({
                paginas: 1,
                totalPaginas: 1,
                dados: result
            })
        } catch (error: any) {
            console.error(`Error fetching meditations: ${error.message}`)
            res.status(500).json({ error: 'Failed to fetch meditations' })
        }
    }
}