import { Romcal } from 'romcal'
import { GeneralRoman_PtBr } from '@romcal/calendar.general-roman'

type LiturgicalDay = {
    data: string
    descricao: string
    tipo: string
    tempo: string
    preceito: boolean
    dia_semana: string
}

export class LiturgicalCalendarService {
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

    async getYearLiturgicalDays(year: number): Promise<Record<string, LiturgicalDay[]>> {
        const months = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ]

        const result: Record<string, LiturgicalDay[]> = {}

        for (let month = 1; month <= 12; month++) {
            const days = await this.getMonthLiturgicalDays(year, month)
            const monthName = months[month - 1]

            if (monthName) {
                result[monthName] = days
            }
        }

        return result
    }

    async getMonthLiturgicalDays(year: number, month: number): Promise<LiturgicalDay[]> {
        const calendar = await this.romcal.generateCalendar(year)
        const monthString = String(month).padStart(2, '0')

        const result: LiturgicalDay[] = []

        for (const [date, celebrations] of Object.entries(calendar)) {
            if (!date.startsWith(`${year}-${monthString}`)) continue

            const selected = celebrations.find(c => c.definition.seasonNames?.[0]) || celebrations[0]

            if (selected) {
                const weekDay = new Date(`${date}T12:00:00`).toLocaleDateString('pt-BR', {
                    weekday: 'long'
                })

                result.push({
                    data: date,
                    descricao: selected.definition.name,
                    tipo: selected.definition.rankName,
                    tempo: selected.definition.seasonNames?.[0] ?? 'Tempo Comum',
                    preceito: selected.isHolyDayOfObligation ?? false,
                    dia_semana: weekDay
                })
            }
        }

        return result
    }
}