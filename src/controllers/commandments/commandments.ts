import { Request, Response } from "express"
import { CommandmentsService } from "../../services/doutrine/commandments.js"

export class CommandmentsController {
    private service: CommandmentsService = new CommandmentsService()

    async get(_req: Request, res: Response): Promise<void> {
        try {
            const result = await this.service.get()
            res.status(200).json({
                paginas: 1,
                totalPaginas: 1,
                dados: result
            })
        } catch (error: any) {
            console.error(`Error fetching commandments: ${error.message}`)
            res.status(500).json({ error: 'Failed to fetch commandments' })
        }
    }
}