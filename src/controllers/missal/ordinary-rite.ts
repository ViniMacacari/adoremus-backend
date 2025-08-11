import { Request, Response } from "express"
import { OrdinaryRiteMissal } from "../../services/missal/ordinary-rite.js"

export class OrdinaryRiteMissalController {
    private service: OrdinaryRiteMissal = new OrdinaryRiteMissal()

    async get(_req: Request, res: Response): Promise<void> {
        try {
            const result = await this.service.getMissal()
            res.status(200).json({
                paginas: 1,
                totalPaginas: 1,
                dados: result
            })
        } catch (error: any) {
            console.error(`Error fetching missal: ${error.message}`)
            res.status(500).json({ error: 'Failed to fetch missal' })
        }
    }
}