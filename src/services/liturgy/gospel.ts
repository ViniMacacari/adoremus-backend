import { PostgresDatabase } from "../../database/postgresql.js"

export class GospelLiturgyService {
    private db: PostgresDatabase = new PostgresDatabase()

    async getToday() {
        const todayRange = this.getTodayRange()

        const rows = await this.db.exec(
            'SELECT * FROM liturgia_diaria WHERE data_liturgia BETWEEN $1 AND $2 LIMIT 1',
            [todayRange.start, todayRange.end]
        )

        if (rows.length === 0) return null
        return rows[0]
    }

    private getTodayRange(): { start: string, end: string } {
        const today = new Date()
        const year = today.getFullYear()
        const month = String(today.getMonth() + 1).padStart(2, '0')
        const day = String(today.getDate()).padStart(2, '0')

        return {
            start: `${year}-${month}-${day} 00:00:00`,
            end: `${year}-${month}-${day} 23:59:59`
        }
    }
}