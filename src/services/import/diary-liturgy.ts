import { PostgresDatabase } from "../../database/postgresql.js"
import { VaticanNewsScrappingService } from "../scrapping/vatican-news-liturgy.js"

export class ImportDiaryLiturgy {
    private db: PostgresDatabase = new PostgresDatabase()
    private vaticanNewsScrapping: VaticanNewsScrappingService = new VaticanNewsScrappingService()

    async import(): Promise<void> {
        const result = await this.vaticanNewsScrapping.getToday()
        const timestamp = this.toPostgresTimestamp(result.date)

        const check = await this.db.exec(
            'SELECT 1 FROM liturgia_diaria WHERE data_liturgia = $1 LIMIT 1',
            [timestamp]
        )

        if (check.length > 0) {
            console.log('Liturgia já existente para a data:', result.date)
            return
        }

        await this.db.exec(
            `INSERT INTO liturgia_diaria (
                liturgia,
                data_liturgia,
                primeira_leitura,
                segunda_leitura,
                evangelho,
                mensagem_papa
            ) VALUES ($1, $2, $3, $4, $5, $6)`,
            [
                result.celebration,
                timestamp,
                result.firstReading.reference,
                result.secondReading?.reference ?? null,
                result.gospel.reference,
                result.popeMessage
            ]
        )

        console.log('Liturgia importada com sucesso para:', result.date)
    }

    private toPostgresTimestamp(dateStr: string): string {
        const [day, month, year] = dateStr.split('/')
        const date = new Date(`${year}-${month}-${day}T00:00:00-03:00`)
        const iso = date.toISOString()
        return iso.replace('T', ' ').replace('Z', '')
    }
}