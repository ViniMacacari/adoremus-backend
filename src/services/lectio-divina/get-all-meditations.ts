import { PostgresDatabase } from "../../database/postgresql.js"

export class LectioDivinaAllService {
    private db: PostgresDatabase = new PostgresDatabase()

    async get(): Promise<any> {
        try {
            const lectio = await this.db.exec('select id, passagem, data from view_lectio_divina')

            return {
                lectio: lectio
            }
        } catch (error: any) {
            throw new Error(`Erro ao obter as meditações: ${error.message}`)
        }
    }
}