import { PostgresDatabase } from "../../database/postgresql.js"

export class GetBreviaryService {
    private db: PostgresDatabase = new PostgresDatabase()

    async get(day: number, month: number, year: number, lang: string = 'pt_BR'): Promise<any> {
        try {
            const date = new Date(year, month - 1, day)
            const dateString = date.toISOString().split('T')[0]

            const sql = `
                select *
                from liturgia_das_horas
                where data = $1
                  and lingua = $2
            `

            const result = await this.db.exec(sql, [dateString, lang])

            return result
        } catch (error: any) {
            throw new Error(`Erro ao obter breviário: ${error.message}`)
        }
    }
}