import { PostgresDatabase } from "../../database/postgresql.js"

type Prayer = {
    id: number,
    nome: string,
    conhecido_como: string,
    origem: string,
    historia: string,
    nacionalidade: string,
    nascimento: string,
    martir: boolean
}

type PrayersFilters = {
    id?: number,
    nome?: string,
    conteudo?: string
}

export class AllPrayersService {
    private db: PostgresDatabase = new PostgresDatabase()

    async countPrayers(filters?: PrayersFilters): Promise<number> {
        let query = 'select count(*) from view_oracoes where 1=1'
        const params: any[] = []

        if (filters?.id) {
            params.push(filters.id)
            query += ` and id = $${params.length}`
        }

        if (filters?.nome) {
            params.push(`%${filters.nome}%`)
            query += ` and nome ilike $${params.length}`
        }

        if (filters?.conteudo) {
            params.push(`%${filters.conteudo}%`)
            query += ` and oracao ilike $${params.length}`
        }

        try {
            const result = await this.db.exec(query, params)
            return Number(result[0].count || 0)
        } catch (error: any) {
            console.error('Error counting saints:', error.message)
            throw new Error('Failed to count saints')
        }
    }

    async searchPrayers(filters?: PrayersFilters, page = 1, limit = 20): Promise<Prayer[]> {
        let query = 'select * from view_oracoes where 1=1'
        const params: any[] = []

        if (filters?.id) {
            params.push(filters.id)
            query += ` and id = $${params.length}`
        }

        if (filters?.nome) {
            params.push(`%${filters.nome}%`)
            query += ` and nome ilike $${params.length}`
        }

        if (filters?.conteudo) {
            params.push(`%${filters.conteudo}%`)
            query += ` and oracao ilike $${params.length}`
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