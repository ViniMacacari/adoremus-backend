import { Request, Response } from "express"
import { GetBlogPost } from "../../services/blog/get-blog-post.js"

export class BlogController {
    private service: GetBlogPost = new GetBlogPost()

    async getPosts(req: Request, res: Response): Promise<void> {
        try {
            const page = Number(req.query.page) || 1
            const limit = 5

            const filters = {
                id: req.query.id ? Number(req.query.id) : undefined,
                titulo: req.query.titulo ? String(req.query.titulo) : undefined,
                subtitulo: req.query.subtitulo ? String(req.query.subtitulo) : undefined,
                conteudo: req.query.conteudo ? String(req.query.conteudo) : undefined,
                autor: req.query.autor ? String(req.query.autor) : undefined,
                data_postagem: req.query.data_postagem ? String(req.query.data_postagem) : undefined,
                categoria: req.query.categoria ? Number(req.query.categoria) : undefined
            }

            const totalRegistros = await this.service.countPosts(filters)
            const dados = await this.service.get(filters, page, limit)

            res.status(200).json({
                pagina: page,
                totalPaginas: Math.ceil(totalRegistros / limit),
                dados
            })
        } catch (error: any) {
            console.error("Erro ao buscar postagens:", error.message)
            res.status(500).json({ error: "Erro ao buscar postagens" })
        }
    }

    async getPostBySlug(req: Request, res: Response): Promise<void> {
        try {
            const slugFilter = req.params.slug

            if (!slugFilter) {
                res.status(400).json({ error: "Slug não fornecido" })
                return
            }

            const dados = await this.service.getBySlug(slugFilter)

            if (!dados) {
                res.status(404).json({ error: "Postagem não encontrada" })
                return
            }

            res.status(200).json({
                pagina: 1,
                totalPaginas: 1,
                dados
            })
        } catch (error: any) {
            console.error("Erro ao buscar postagens:", error.message)
            res.status(500).json({ error: "Erro ao buscar postagens" })
        }
    }
}