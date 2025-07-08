import { PostgresDatabase } from "../../database/postgresql.js"

export class RosaryMysteriesService {
    private db: PostgresDatabase = new PostgresDatabase()

    async get(): Promise<any> {
        try {
            const mysteries = await this.db.exec('select * from view_terco')
            const prayers = await this.db.exec('select * from view_oracoes_terco')

            return {
                misterios: mysteries,
                oracoes: prayers
            }
        } catch (error: any) {
            throw new Error(`Erro ao obter os mistérios do rosário: ${error.message}`)
        }
    }
}