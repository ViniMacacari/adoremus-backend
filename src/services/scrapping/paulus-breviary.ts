import axios from 'axios'
import * as cheerio from 'cheerio'

export interface BreviarySection {
    title: string
    content: string
}

export interface BreviaryOffice {
    name: string
    sections: BreviarySection[]
}

export class GetPaulusBreviary {
    private readonly baseUrl: string

    constructor() {
        this.baseUrl =
            'https://www.paulus.com.br/portal/liturgia-diaria-das-horas'
    }

    async getToday(): Promise<BreviaryOffice[]> {
        const { data: html } = await axios.get(this.baseUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (LiturgiaScraper/1.1)' }
        })

        const $ = cheerio.load(html)
        const offices: BreviaryOffice[] = []

        let currentOffice: BreviaryOffice | null = null
        let currentSection: BreviarySection | null = null

        const clean = (t: string): string =>
            t
                .replace(/\s+/g, ' ')
                .replace(/[–•*\/]+/g, ' ')
                .replace(/\s\s+/g, ' ')
                .replace(/\s([,;:.!?])/g, '$1')
                .trim()

        $('#texto')
            .children()
            .each((_, el) => {
                const tag = $(el).prop('tagName')
                const text = $(el).text().trim()
                if (!text) return

                if ($(el).hasClass('liturgia_ant')) {
                    if (currentOffice) offices.push(currentOffice as BreviaryOffice)
                    currentOffice = { name: clean(text), sections: [] }
                    currentSection = null
                    return
                }

                if ($(el).hasClass('liturgia-customizado')) {
                    if (currentSection && currentOffice)
                        (currentOffice as BreviaryOffice).sections.push(
                            currentSection as BreviarySection
                        )
                    currentSection = { title: clean(text), content: '' }
                    return
                }

                if (currentSection && (tag === 'P' || tag === 'DIV')) {
                    currentSection.content += clean(text) + '\n'
                }
            })

        if (currentSection && currentOffice)
            (currentOffice as BreviaryOffice).sections.push(
                currentSection as BreviarySection
            )
        if (currentOffice) offices.push(currentOffice as BreviaryOffice)

        return offices
    }
}