import { PostgresDatabase } from "../../database/postgresql.js"
import { DateTime } from "luxon"

export class GospelLiturgyService {
    private db: PostgresDatabase = new PostgresDatabase()

    async getToday(locale?: string) {
        const todayRange = this.getTodayRange(locale)

        const rows = await this.db.exec(
            'SELECT * FROM liturgia_diaria WHERE data_liturgia BETWEEN $1 AND $2 LIMIT 1',
            [todayRange.start, todayRange.end]
        )

        if (rows.length === 0) return null
        return rows[0]
    }

    private getTodayRange(locale?: string): { start: string, end: string } {
        let now

        if (locale === 'br') {
            now = DateTime.now().setZone('America/Sao_Paulo')
        } else {
            now = DateTime.now()
        }

        const start = now.startOf('day').toFormat('yyyy-MM-dd HH:mm:ss')
        const end = now.endOf('day').toFormat('yyyy-MM-dd HH:mm:ss')

        return { start, end }
    }
}