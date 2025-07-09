import { Romcal } from 'romcal'
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

    async getMonthLiturgicalDays(year: number, month: number): Promise<{
        date: string
        name: string
        rank: string
        season: string
        holyDay: boolean
        weekDay: string
    }[]> {
        const calendar = await this.romcal.generateCalendar(year)
        const monthString = String(month).padStart(2, '0')

        const result: {
            date: string
            name: string
            rank: string
            season: string
            holyDay: boolean
            weekDay: string
        }[] = []

        for (const [date, celebrations] of Object.entries(calendar)) {
            if (!date.startsWith(`${year}-${monthString}`)) continue

            const selected = celebrations.find(c => c.definition.seasonNames?.[0]) || celebrations[0]

            if (selected) {
                const weekDay = new Date(`${date}T12:00:00`).toLocaleDateString('pt-BR', {
                    weekday: 'long'
                })

                result.push({
                    date,
                    name: selected.definition.name,
                    rank: selected.definition.rankName,
                    season: selected.definition.seasonNames?.[0] ?? 'Tempo Comum',
                    holyDay: selected.isHolyDayOfObligation ?? false,
                    weekDay
                })
            }
        }

        return result
    }
}