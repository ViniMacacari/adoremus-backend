import { PostgresDatabase } from "../../database/postgresql.js"

export class OrdinaryRiteMissal {
    private db: PostgresDatabase = new PostgresDatabase()

    async getMissal(): Promise<any> {
        try {
            return await this.db.exec("select id, nome, texto_pt, texto_latim from missal where rito = 'Ordinário' order by id")
        } catch (error: any) {
            throw new Error(`Erro ao obter dados do missal`)
        }
    }
}