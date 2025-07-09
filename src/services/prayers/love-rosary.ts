import { PostgresDatabase } from "../../database/postgresql.js"

export class LoveRosaryService {
    private db: PostgresDatabase = new PostgresDatabase()

    async get(): Promise<any> {
        try {
            const mysteries = await this.db.exec('select * from view_oracoes_terco_amor')

            return {
                misterios: mysteries
            }
        } catch (error: any) {
            throw new Error(`Erro ao obter os mistérios do rosário: ${error.message}`)
        }
    }
}