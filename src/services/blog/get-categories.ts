import { PostgresDatabase } from "../../database/postgresql.js"

export class GetCategoriesService {
    private db: PostgresDatabase = new PostgresDatabase()

    async get(): Promise<any> {
        try {
            return await this.db.exec('select * from categorias_postagens order by 3')
        } catch (error: any) {
            throw new Error(`Erro ao obter as categorias: ${error.message}`)
        }
    }
}