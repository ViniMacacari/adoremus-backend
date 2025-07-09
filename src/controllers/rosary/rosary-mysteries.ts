import { Request, Response } from "express"
import { RosaryMysteriesService } from "../../services/rosary/rosary-mysteries.js"

export class RosaryMysteriesController {
    private service: RosaryMysteriesService = new RosaryMysteriesService()

    async get(_req: Request, res: Response): Promise<void> {
        try {
            const result = await this.service.get()
            res.status(200).json({
                paginas: 1,
                dados: result
            })
        } catch (error: any) {
            console.error(`Error fetching rosary mysteries: ${error.message}`)
            res.status(500).json({ error: 'Failed to fetch rosary mysteries' })
        }
    }
}