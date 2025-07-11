import { PostgresDatabase } from "../../database/postgresql.js"

export class LectioDivinaService {
    private db: PostgresDatabase = new PostgresDatabase()

    async get(id: number): Promise<any> {
        try {
            const lectio = await this.db.exec('select * from view_lectio_divina where id = $1', [id])

            return {
                lectio: lectio[0]
            }
        } catch (error: any) {
            throw new Error(`Erro ao obter as meditações: ${error.message}`)
        }
    }
}