import axios from 'axios'
import * as cheerio from 'cheerio'
import he from 'he'
import { CookieJar } from 'tough-cookie'
import { wrapper } from 'axios-cookiejar-support'

export type Hour =
    | 'ufficio_delle_letture'
    | 'lodi'
    | 'ora_media'
    | 'vespri'
    | 'compieta'

export interface LiturgyResult {
    title: string
    html: string
    text: string
}

export interface HourSection {
    html: string
    text: string
}

export interface MediumHourResult {
    title: string
    hour: string
    parts: {
        tercia: HourSection
        sexta: HourSection
        noa: HourSection
    }
}

export class IBreviaryService {
    private readonly baseUrl = 'https://www.ibreviary.com/m2'
    private language: string
    private readonly jar = new CookieJar()
    private readonly client

    constructor(language: string = 'pt') {
        this.language = language
        this.client = wrapper(axios.create({ jar: this.jar, withCredentials: true }))
    }

    setLanguage(language: 'pt' | 'la' | 'it' | 'en' | 'es') {
        this.language = language
    }

    private getBrazilDate(): { year: number; month: number; day: number } {
        const now = new Date()
        const brazil = new Date(now.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }))
        return {
            year: brazil.getFullYear(),
            month: brazil.getMonth() + 1,
            day: brazil.getDate()
        }
    }

    private async setCurrentDay(year?: number, month?: number, day?: number): Promise<void> {
        const date = this.getBrazilDate()
        const finalYear = year ?? date.year
        const finalMonth = month ?? date.month
        const finalDay = day ?? date.day

        const body = new URLSearchParams({
            anno: finalYear.toString(),
            mese: finalMonth.toString(),
            giorno: finalDay.toString(),
            lang: this.language,
            ok: 'ok'
        })

        await this.client.post(`${this.baseUrl}/opzioni.php`, body, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        })
        await this.client.get(`${this.baseUrl}/breviario.php`)
    }

    private cleanHtml(html: string): { html: string; text: string } {
        const $ = cheerio.load(html)

        $('script, style, noscript, header, footer, nav').remove()
        $('a[href*="donazione"], a[href*="newsletter"], a[href*="ibreviary.com"]').remove()

        $('h1').each((_, el) => {
            const node = $(el)
            const newEl = $('<h3>').html(node.html() || node.text())
            node.replaceWith(newEl)
        })

        $('a, p').each((_, el) => {
            const text = $(el).text().trim()
            if (/menu/i.test(text)) $(el).remove()
        })

        $('span, font').each((_, el) => {
            const node = $(el)
            node.replaceWith(node.html() || node.text())
        })

        $('a').remove()

        $('p').each((_, el) => {
            const text = $(el).text().trim()
            if (
                /support the continued development of the iBreviary/i.test(text) ||
                /iBreviary newsletter/i.test(text)
            ) {
                $(el).remove()
            }
        })

        let content = $('body').html() || ''
        content = content.replace(/&nbsp;/g, ' ')
        content = content
            .replace(/(^|[\s>])V\.\s?/g, '$1℣. ')
            .replace(/(^|[\s>])R\.\s?/g, '$1℟. ')
            .replace(/(<br\s*\/?>\s*){3,}/g, '<br><br>')
            .replace(/\n{2,}/g, '\n')
            .replace(/to support the continued development of the iBreviary/gi, '')
            .replace(/iBreviary newsletter/gi, '')
        $('body').html(content)

        const cleanHtml = he.decode($.html().trim())
        const cleanText = he.decode($.text().replace(/\s{2,}/g, ' ').trim())

        return { html: cleanHtml, text: cleanText }
    }

    async getHour(hour: Hour, year?: number, month?: number, day?: number): Promise<LiturgyResult> {
        await this.setCurrentDay(year, month, day)
        const url = `${this.baseUrl}/breviario.php?s=${hour}&lang=${this.language}`
        const { data } = await this.client.get(url)
        const $ = cheerio.load(data)
        const content = $('#contenuto .inner')
        const { html: cleanedHtml, text: cleanedText } = this.cleanHtml(content.html() || '')
        const title = content.find('h3').first().text().trim() || hour
        return { title, html: cleanedHtml, text: cleanedText }
    }

    async getSeparatedMediumHour(year?: number, month?: number, day?: number): Promise<MediumHourResult> {
        await this.setCurrentDay(year, month, day)
        const url = `${this.baseUrl}/breviario.php?s=ora_media&lang=${this.language}`
        const { data } = await this.client.get(url)
        const $ = cheerio.load(data)
        const content = $('#contenuto .inner')
        const allChildren = content.children().toArray()

        const hourNames = {
            pt: { tercia: /T[ée]rcia/i, sexta: /Sexta/i, noa: /Noa/i },
            la: { tercia: /\bAd\s*Terti(am|a)\b/i, sexta: /\bAd\s*Sext(am|a)\b/i, noa: /\bAd\s*Non(am|a)\b/i },
            it: { tercia: /Terza/i, sexta: /Sesta/i, noa: /Nona/i },
            en: { tercia: /Terce|Midmorning/i, sexta: /Sext|Midday/i, noa: /None|Afternoon/i },
            es: { tercia: /Tercia/i, sexta: /Sexta/i, noa: /Nona/i }
        }[this.language] || { tercia: /T[ée]rcia/i, sexta: /Sexta/i, noa: /Noa/i }

        const useLast = ['la', 'it', 'en'].includes(this.language)

        const findHourIndex = (regex: RegExp): number => {
            let index = -1
            allChildren.forEach((el, i) => {
                if ($(el).text().match(regex)) {
                    if (useLast) index = i
                    else if (index === -1) index = i
                }
            })
            return index
        }

        const idxTercia = findHourIndex(hourNames.tercia)
        const idxSexta = findHourIndex(hourNames.sexta)
        const idxNoa = findHourIndex(hourNames.noa)

        if (idxTercia === -1)
            throw new Error(`Não foi possível localizar as seções da Hora Intermédia (${this.language}).`)

        let commonIntroHtml = ''
        if (['pt', 'es'].includes(this.language)) {
            const commonIntroEls = allChildren.slice(0, idxTercia)
            commonIntroHtml = commonIntroEls.map(el => $.html(el)).join('')
        }

        const getSectionHtml = (start: number, end?: number) => {
            const sectionEls = allChildren.slice(start, end)
            const sectionHtml = sectionEls.map(el => $.html(el)).join('')
            const fullHtml = commonIntroHtml ? commonIntroHtml + sectionHtml : sectionHtml
            return this.cleanHtml(fullHtml)
        }

        const tercia = getSectionHtml(idxTercia, idxSexta !== -1 ? idxSexta : undefined)
        const sexta = idxSexta !== -1
            ? getSectionHtml(idxSexta, idxNoa !== -1 ? idxNoa : undefined)
            : { html: '', text: '' }
        const noa = idxNoa !== -1 ? getSectionHtml(idxNoa) : { html: '', text: '' }

        return {
            title: 'Medium Hour',
            hour: 'Intermediate Hour',
            parts: { tercia, sexta, noa }
        }
    }

    async getAllHours(year?: number, month?: number, day?: number): Promise<Record<Hour, LiturgyResult>> {
        await this.setCurrentDay(year, month, day)
        const hours: Hour[] = [
            'ufficio_delle_letture',
            'lodi',
            'ora_media',
            'vespri',
            'compieta'
        ]
        const result: Record<Hour, LiturgyResult> = {} as any
        for (const hour of hours) {
            result[hour] = await this.getHour(hour, year, month, day)
        }
        return result
    }
}