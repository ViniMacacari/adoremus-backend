import { Romcal, LiturgicalDay } from 'romcal'
import { GeneralRoman_PtBr } from '@romcal/calendar.general-roman'

export class LiturgyService {
    private romcal: Romcal

    constructor() {
        this.romcal = new Romcal({
            localizedCalendar: GeneralRoman_PtBr,
            scope: 'gregorian',
            epiphanyOnSunday: true,
            ascensionOnSunday: true,
            corpusChristiOnSunday: false
        })
    }

    async getMonthLiturgicalDays(year: number, month: number): Promise<{ date: string, name: string, rank: string, season: string }[]> {
        const calendar: Record<string, LiturgicalDay[]> = await this.romcal.generateCalendar(year)

        const monthString = String(month).padStart(2, '0')

        const result = Object.entries(calendar)
            .filter(([date]) => date.startsWith(`${year}-${monthString}`))
            .map(([date, celebrations]) => {
                const weekday = celebrations.find(c => c.definition.rankName === 'dia de semana' || c.definition.seasonNames[0])
                if (!weekday) return null

                const def = weekday.definition
                const season = def.seasonNames[0]
                if (!season) return null

                return {
                    date,
                    name: def.name,
                    rank: def.rankName,
                    season
                }
            })
            .filter((d): d is { date: string, name: string, rank: string, season: string } => d !== null)

        return result
    }
}