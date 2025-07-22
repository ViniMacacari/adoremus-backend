import { PostgresDatabase } from "../../database/postgresql.js"

export class LectioDivinaAllService {
    private db: PostgresDatabase = new PostgresDatabase()

    async get(): Promise<any> {
        try {
            const lectio = await this.db.exec('select id, passagem, data from view_lectio_divina')

            const result = lectio.map((item: any) => {
                const d = new Date(item.data)
                const year = d.getFullYear()
                const month = String(d.getMonth() + 1).padStart(2, '0')
                const day = String(d.getDate()).padStart(2, '0')
                return {
                    ...item,
                    data: `${year}-${month}-${day}`
                }
            })

            return {
                lectio: result
            }
        } catch (error: any) {
            throw new Error(`Erro ao obter as meditações: ${error.message}`)
        }
    }
}