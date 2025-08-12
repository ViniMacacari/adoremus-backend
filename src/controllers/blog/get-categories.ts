import { Request, Response } from "express"
import { GetCategoriesService } from "../../services/blog/get-categories.js"

export class GetCategoriesController {
    private service: GetCategoriesService = new GetCategoriesService()

    async get(_req: Request, res: Response): Promise<void> {
        try {
            const result = await this.service.get()
            res.status(200).json({
                paginas: 1,
                totalPaginas: 1,
                dados: result
            })
        } catch (error: any) {
            console.error(`Error fetching categories: ${error.message}`)
            res.status(500).json({ error: 'Failed to fetch categories' })
        }
    }
}