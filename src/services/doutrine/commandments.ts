import { PostgresDatabase } from "../../database/postgresql.js"

export class CommandmentsService {
    private db: PostgresDatabase = new PostgresDatabase()

    async get(): Promise<any> {
        try {
            const commandments = await this.db.exec('select * from view_mandamentos')

            const result = {
                mandamentos10: [] as any[],
                mandamentosIgreja: [] as any[]
            }

            for (const cmd of commandments) {
                if (cmd.grupo_mandamento === '10 Mandamentos') {
                    result.mandamentos10.push(cmd)
                } else if (cmd.grupo_mandamento === '5 Mandamentos da Igreja') {
                    result.mandamentosIgreja.push(cmd)
                }
            }

            return result
        } catch (error: any) {
            throw new Error(`Erro ao obter os mandamentos: ${error.message}`)
        }
    }
}