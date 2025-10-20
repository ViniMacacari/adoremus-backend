import { PostgresDatabase } from "../../database/postgresql.js"

export class GetBreviaryService {
    private db: PostgresDatabase = new PostgresDatabase()

    async get(day: number, month: number, year: number, lang: string = 'pt_BR'): Promise<any> {
        try {
            const cycleId = await this.db.exec('select id from ciclos_liturgicos cl where ciclo_liturgico_do_ano($1) = cl.ciclo', [year])

            const sql = 'select * from liturgia_das_horas where dia = $1 and mes = $2 and ciclo_liturgico = $3 and lingua = $4'

            const result = await this.db.exec(sql, [day, month, cycleId[0].id, lang])

            return result
        } catch (error: any) {
            throw new Error(`Erro ao obter breviário: ${error.message}`)
        }
    }
}