import { PostgresDatabase } from "../../database/postgresql.js"

type Saint = {
    id: number,
    nome: string,
    conhecido_como: string,
    origem: string,
    historia: string,
    nacionalidade: string,
    nascimento: string,
    martir: boolean
}

type SaintsFilters = {
    nome?: string,
    nacionalidade?: string,
    martir?: boolean
}

export class SaintsService {
    private db: PostgresDatabase = new PostgresDatabase()

    async countSaints(filters?: SaintsFilters): Promise<number> {
        let query = 'select count(*) from view_santos where 1=1'
        const params: any[] = []

        if (filters?.nome) {
            params.push(`%${filters.nome}%`)
            query += ` and nome ilike $${params.length}`
        }

        if (filters?.nacionalidade) {
            params.push(`%${filters.nacionalidade}%`)
            query += ` and nacionalidade ilike $${params.length}`
        }

        if (typeof filters?.martir === 'boolean') {
            params.push(filters.martir)
            query += ` and martir = $${params.length}`
        }

        try {
            const result = await this.db.exec(query, params)
            return Number(result[0].count || 0)
        } catch (error: any) {
            console.error('Error counting saints:', error.message)
            throw new Error('Failed to count saints')
        }
    }

    async searchSaints(filters?: SaintsFilters, page = 1, limit = 20): Promise<Saint[]> {
        let query = 'select * from view_santos where 1=1'
        const params: any[] = []

        if (filters?.nome) {
            params.push(`%${filters.nome}%`)
            query += ` and nome ilike $${params.length}`
        }

        if (filters?.nacionalidade) {
            params.push(`%${filters.nacionalidade}%`)
            query += ` and nacionalidade ilike $${params.length}`
        }

        if (typeof filters?.martir === 'boolean') {
            params.push(filters.martir)
            query += ` and martir = $${params.length}`
        }

        const offset = (page - 1) * limit
        query += ` limit $${params.length + 1} offset $${params.length + 2}`
        params.push(limit, offset)

        try {
            const result = await this.db.exec(query, params)
            return result
        } catch (error: any) {
            console.error('Error searching saints:', error.message)
            throw new Error('Failed to search saints')
        }
    }
}