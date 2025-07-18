import { Request, Response } from "express"
import { SaintsService } from "../../services/people/get-saints.js"

export class SaintsController {
    private service: SaintsService = new SaintsService()

    async get(req: Request, res: Response): Promise<void> {
        const { pagina = '1', nome, nacionalidade, id, martir } = req.query

        const parsedPage = Number(pagina)
        const currentPage = isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage

        try {
            const result = await this.service.searchSaints(
                {
                    id: typeof id === 'string' ? Number(id) : undefined,
                    nome: typeof nome === 'string' ? nome : undefined,
                    nacionalidade: typeof nacionalidade === 'string' ? nacionalidade : undefined,
                    martir: martir === 'true' ? true : martir === 'false' ? false : undefined
                },
                currentPage
            )

            const total = await this.service.countSaints({
                id: typeof id === 'string' ? Number(id) : undefined,
                nome: typeof nome === 'string' ? nome : undefined,
                nacionalidade: typeof nacionalidade === 'string' ? nacionalidade : undefined,
                martir: martir === 'true' ? true : martir === 'false' ? false : undefined
            })

            const totalPages = Math.ceil(total / 20)

            res.status(200).json({
                pagina: currentPage,
                totalPaginas: totalPages,
                dados: result
            })
        } catch (error: any) {
            console.error(`Error fetching rosary mysteries: ${error.message}`)
            res.status(500).json({ error: 'Failed to fetch rosary mysteries' })
        }
    }
}