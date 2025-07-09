import { PostgresDatabase } from "../../database/postgresql.js"

export class CommandmentsService {
    private db: PostgresDatabase = new PostgresDatabase()

    async get(): Promise<any> {
        try {
            const commandments = await this.db.exec('select * from view_mandamentos')

            return {
                mandamentos: commandments
            }
        } catch (error: any) {
            throw new Error(`Erro ao obter os mistérios do terço do amor: ${error.message}`)
        }
    }
}