import { PostgresDatabase } from "../../database/postgresql.js"

type BlogPostFilters = {
    id?: number
    titulo?: string
    subtitulo?: string
    conteudo?: string
    autor?: string
    data_postagem?: string
    categoria?: number
}

export class GetBlogPost {
    private db: PostgresDatabase = new PostgresDatabase()

    async get(filters?: BlogPostFilters, page = 1, limit = 10): Promise<any[]> {
        let query = 'select id, titulo, subtitulo, resumo, autor, data_postagem, categoria, slug from postagens where 1=1'
        const params: any[] = []

        if (filters?.id) {
            params.push(filters.id)
            query += ` and id = $${params.length}`
        }

        if (filters?.titulo) {
            params.push(`%${filters.titulo}%`)
            query += ` and titulo ilike $${params.length}`
        }

        if (filters?.subtitulo) {
            params.push(`%${filters.subtitulo}%`)
            query += ` and subtitulo ilike $${params.length}`
        }

        if (filters?.conteudo) {
            params.push(`%${filters.conteudo}%`)
            query += ` and conteudo ilike $${params.length}`
        }

        if (filters?.autor) {
            params.push(`%${filters.autor}%`)
            query += ` and autor ilike $${params.length}`
        }

        if (filters?.data_postagem) {
            params.push(filters.data_postagem)
            query += ` and date(data_postagem) = $${params.length}`
        }

        if (filters?.categoria) {
            params.push(filters.categoria)
            query += ` and categoria = $${params.length}`
        }

        query += ' order by data_postagem desc'

        const offset = (page - 1) * limit
        params.push(limit, offset)
        query += ` limit $${params.length - 1} offset $${params.length}`

        try {
            return await this.db.exec(query, params)
        } catch (error: any) {
            throw new Error(`Erro ao obter as postagens: ${error.message}`)
        }
    }

    async countPosts(filters?: BlogPostFilters): Promise<number> {
        let query = 'select count(*) from postagens where 1=1'
        const params: any[] = []

        if (filters?.id) {
            params.push(filters.id)
            query += ` and id = $${params.length}`
        }

        if (filters?.titulo) {
            params.push(`%${filters.titulo}%`)
            query += ` and titulo ilike $${params.length}`
        }

        if (filters?.subtitulo) {
            params.push(`%${filters.subtitulo}%`)
            query += ` and subtitulo ilike $${params.length}`
        }

        if (filters?.conteudo) {
            params.push(`%${filters.conteudo}%`)
            query += ` and conteudo ilike $${params.length}`
        }

        if (filters?.autor) {
            params.push(`%${filters.autor}%`)
            query += ` and autor ilike $${params.length}`
        }

        if (filters?.data_postagem) {
            params.push(filters.data_postagem)
            query += ` and date(data_postagem) = $${params.length}`
        }

        if (filters?.categoria) {
            params.push(filters.categoria)
            query += ` and categoria = $${params.length}`
        }

        try {
            const result = await this.db.exec(query, params)
            return Number(result[0].count || 0)
        } catch (error: any) {
            throw new Error(`Erro ao contar as postagens: ${error.message}`)
        }
    }

    async getById(id: number): Promise<any> {
        const query = 'select * from postagens where id = $1'
        try {
            const result = await this.db.exec(query, [id])
            return result[0] || null
        } catch (error: any) {
            throw new Error(`Erro ao obter a postagem por ID: ${error.message}`)
        }
    }
}