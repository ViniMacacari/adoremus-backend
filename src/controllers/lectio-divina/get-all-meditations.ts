import { Request, Response } from "express"
import { LectioDivinaAllService } from "../../services/lectio-divina/get-all-meditations.js"

export class LectioDivinaAllController {
    private service: LectioDivinaAllService = new LectioDivinaAllService()

    async get(_req: Request, res: Response): Promise<void> {
        try {
            const result = await this.service.get()
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