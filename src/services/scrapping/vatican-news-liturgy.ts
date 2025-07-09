import axios from 'axios'
import * as cheerio from 'cheerio'
import { bookAbbreviations } from '../../database/book-abreviations'

type Reading = {
    title: string
    reference: string
    content: string
}

type LiturgicalContent = {
    date: string
    celebration: string
    firstReading: Reading
    secondReading?: Reading | null
    gospel: Reading
    popeMessage: string
}

export class VaticanNewsScrappingService {
    async getToday(): Promise<LiturgicalContent> {
        const today = new Date()
        const year = today.getFullYear()
        const month = String(today.getMonth() + 1).padStart(2, '0')
        const day = String(today.getDate()).padStart(2, '0')
        const input = `${year}-${month}-${day}`
        return this.getByCustomDate(input)
    }

    async getByCustomDate(input: string): Promise<LiturgicalContent> {
        const [year, month, day] = input.split('-')
        if (!year || !month || !day) throw new Error('Invalid date format. Use YYYY-MM-DD.')
        const formattedDate = `${year}/${month}/${day}`
        return this.getByVaticanDate(formattedDate)
    }

    private async getByVaticanDate(date: string): Promise<LiturgicalContent> {
        const url = `https://www.vaticannews.va/pt/palavra-do-dia/${date}.html`
        const { data: html } = await axios.get(url)
        const $ = cheerio.load(html)

        const celebration = $('.indicazioneLiturgica span').text().trim()
        const liturgicalDate = $('#dataFilter-text').text().trim()

        const extractSectionParagraphs = (title: string): string[] => {
            const h2 = $(`.section__head > h2:contains("${title}")`).first()
            const section = h2.closest('.section')?.find('.section__wrapper')
            if (!section) return []
            return section.find('p').toArray().map(p => $(p).text().replace(/<br\s*\/?>/gi, '').replace(/&nbsp;/g, '').trim()).filter(Boolean)
        }

        const parseReading = (paragraphs: string[] | any): Reading => {
            if (!paragraphs || paragraphs.length === 0)
                return { title: '', reference: '', content: '' }

            let title = ''
            let reference: any = ''
            const contentLines: string[] = []

            if (
                paragraphs.length >= 3 &&
                (paragraphs[0].toLowerCase().includes('primeira leitura') ||
                    paragraphs[0].toLowerCase().includes('segunda leitura'))
            ) {
                title = paragraphs[1].trim()
                reference = paragraphs[2].trim()
                paragraphs.splice(0, 3)
            }

            for (let i = 0; i < paragraphs.length; i++) {
                const line: any = paragraphs[i].trim()
                for (const book of Object.keys(bookAbbreviations)) {
                    if (line.toLowerCase().includes(book.toLowerCase())) {
                        title = line
                        paragraphs.splice(i, 1)
                        break
                    }
                }
                if (title) break
            }

            if (!title) {
                title = paragraphs.shift()?.trim() ?? ''
            }

            if (paragraphs.length && /^\d{1,3},[\d\-a-zA-Z.]+/.test(paragraphs[0])) {
                reference = paragraphs.shift()!.trim()
            }

            if (reference && !/[a-zA-Z]{2,4}/.test(reference.split(',')[0]) && title) {
                for (const [fullName, abbreviation] of Object.entries(bookAbbreviations)) {
                    if (title.toLowerCase().includes(fullName.toLowerCase())) {
                        reference = `${abbreviation} ${reference}`
                        break
                    }
                }
            }

            for (const p of paragraphs) {
                if (p.trim()) contentLines.push(p.trim())
            }

            return {
                title,
                reference,
                content: contentLines.join('\n').trim()
            }
        }

        const readingParagraphs = extractSectionParagraphs('Leitura do Dia')
        const secondReadingIndex = readingParagraphs.findIndex(p => p.toLowerCase().includes('segunda leitura'))

        let firstReading: Reading
        let secondReading: Reading | null = null

        if (secondReadingIndex !== -1) {
            const firstPart = readingParagraphs.slice(0, secondReadingIndex)
            const secondPart = readingParagraphs.slice(secondReadingIndex + 1)
            firstReading = parseReading(firstPart)
            secondReading = parseReading(secondPart)
        } else {
            firstReading = parseReading(readingParagraphs)
        }

        const gospelParagraphs = extractSectionParagraphs('Evangelho do Dia')
        const gospel = parseReading(gospelParagraphs)

        const popeParagraphs = extractSectionParagraphs('As palavras dos Papas')
        const popeMessage = popeParagraphs.join('\n').trim()

        return {
            date: liturgicalDate,
            celebration,
            firstReading,
            secondReading,
            gospel,
            popeMessage
        }
    }
}