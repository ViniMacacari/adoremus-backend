import { Request, Response } from "express"
import { AllPrayersService } from "../../services/prayers/all-prayers"

export class AllPrayersController {
    private service: AllPrayersService = new AllPrayersService()

    async get(req: Request, res: Response): Promise<void> {
        const { pagina = '1', nome, conteudo, id } = req.query

        const parsedPage = Number(pagina)
        const currentPage = isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage

        try {
            const result = await this.service.searchPrayers(
                {
                    id: typeof id === 'string' ? Number(id) : undefined,
                    nome: typeof nome === 'string' ? nome : undefined,
                    conteudo: typeof conteudo === 'string' ? conteudo : undefined
                },
                currentPage
            )

            const total = await this.service.countPrayers({
                id: typeof id === 'string' ? Number(id) : undefined,
                nome: typeof nome === 'string' ? nome : undefined,
                conteudo: typeof conteudo === 'string' ? conteudo : undefined
            })

            const totalPages = Math.ceil(total / 20)

            res.status(200).json({
                pagina: currentPage,
                totalPaginas: totalPages,
                dados: result
            })
        } catch (error: any) {
            console.error(`Error fetching prayers: ${error.message}`)
            res.status(500).json({ error: 'Failed to fetch prayers' })
        }
    }
}