import { PostgresDatabase } from "../../database/postgresql.js"
import { IBreviaryService } from "../scrapping/breviary/ibreviary.js"

interface Languages {
    importLanguage: 'pt' | 'la' | 'it' | 'en' | 'es'
    storeLanguage: string
}

export class LiturgyImporter {
    private readonly db: PostgresDatabase
    private readonly ibreviary: IBreviaryService

    constructor() {
        this.db = new PostgresDatabase()
        this.db.init()
        this.ibreviary = new IBreviaryService('pt')
    }

    async import(
        year?: number,
        month?: number,
        day?: number,
        language?: Languages
    ): Promise<void> {
        if (language) {
            this.ibreviary.setLanguage(language.importLanguage)
        }

        const hours = await this.ibreviary.getAllHours(year, month, day)
        const mediumHour = await this.ibreviary.getSeparatedMediumHour(year, month, day)

        const date = this.getBrazilDate(year, month, day)
        const formattedDate = `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`

        const sql = `
        insert into liturgia_das_horas
            (oficio_leitura, laudes, tercia, sexta, noa, vesperas, completas, lingua, data)
        values
            ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        returning id
    `

        const params = [
            hours.ufficio_delle_letture.html,
            hours.lodi.html,
            mediumHour.parts.tercia.html,
            mediumHour.parts.sexta.html,
            mediumHour.parts.noa.html,
            hours.vespri.html,
            hours.compieta.html,
            language?.storeLanguage || 'pt_BR',
            formattedDate
        ]

        try {
            await this.db.exec(sql, params)
        } catch (error: any) {
            console.error(error.message)
        }
    }

    private getBrazilDate(
        year?: number,
        month?: number,
        day?: number
    ): { year: number; month: number; day: number } {
        if (year && month && day) return { year, month, day }
        const now = new Date()
        const brazil = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }))
        return {
            year: brazil.getFullYear(),
            month: brazil.getMonth() + 1,
            day: brazil.getDate()
        }
    }
}