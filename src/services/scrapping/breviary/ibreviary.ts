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
            la: { tercia: /\bAD\s+TERTIAM\b/i, sexta: /\bAD\s+SEXTAM\b/i, noa: /\bAD\s+NONAM\b/i },
            it: { tercia: /\bTerza\b/i, sexta: /\bSesta\b/i, noa: /\bNona\b/i },
            en: { tercia: /\bTerce|Midmorning\b/i, sexta: /\bSext|Midday\b/i, noa: /\bNone|Afternoon\b/i },
            es: { tercia: /\bTercia\b/i, sexta: /\bSexta\b/i, noa: /\bNona\b/i }
        }[this.language] || { tercia: /T[ée]rcia/i, sexta: /Sexta/i, noa: /Noa/i }

        const textAt = (i: number) => $(allChildren[i]).text()

        const firstIndex = (re: RegExp, start = 0) => {
            for (let i = start; i < allChildren.length; i++) {
                if (re.test(textAt(i))) return i
            }
            return -1
        }
        const nextIndexAfter = (start: number, re: RegExp) => firstIndex(re, Math.max(0, start + 1))
        const sliceHtml = (from: number, to?: number) => {
            const els = allChildren.slice(from, to)
            return els.map(el => $.html(el)).join('')
        }

        if (['pt', 'es'].includes(this.language)) {
            const idxT = firstIndex(hourNames.tercia)
            if (idxT === -1) throw new Error(`Não foi possível localizar Tércia (${this.language}).`)
            const idxS = nextIndexAfter(idxT, hourNames.sexta)
            const idxN = idxS === -1 ? -1 : nextIndexAfter(idxS, hourNames.noa)

            const commonIntroHtml = sliceHtml(0, idxT)

            const build = (start: number, end?: number) => {
                if (start === -1) return { html: '', text: '' }
                const full = commonIntroHtml + sliceHtml(start, end)
                return this.cleanHtml(full)
            }

            const tercia = build(idxT, idxS !== -1 ? idxS : undefined)
            const sexta = build(idxS, idxN !== -1 ? idxN : undefined)
            const noa = build(idxN !== -1 ? idxN : -1, undefined)

            return { title: 'Medium Hour', hour: 'Intermediate Hour', parts: { tercia, sexta, noa } }
        }

        const reHymnus = /\bHYMNUS\b/i
        const rePsalmodyTitle = /^\s*PSALMODIA\s*$/i
        const rePsalmodyComplementaris = /PSALMODIA\s+COMPLEMENTARIS/i
        const rePsalmodiaLink = /\bPsalmodia\b/i
        const reLectio = /\bLECTIO\s+BREVIS\b/i
        const reHrTag = /^hr$/i

        const idxHymnus = firstIndex(reHymnus)
        let idxInvoc = firstIndex(/Deus,\s*in\s+adiut[óo]rium/i)
        if (idxInvoc === -1) {
            idxInvoc = firstIndex(/Horam\s+mediam/i)
            if (idxInvoc === -1) idxInvoc = 0
        }

        const idxPsalmodyStart = firstIndex(rePsalmodyTitle)
        const idxPsalmodyEnd = (() => {
            if (idxPsalmodyStart === -1) return -1
            for (let i = idxPsalmodyStart + 1; i < allChildren.length; i++) {
                const tag = (allChildren[i] as any).tagName || ''
                const txt = textAt(i)
                if (reHrTag.test(tag)) return i
                if (reLectio.test(txt)) return i
            }
            return -1
        })()

        if (idxHymnus === -1 || idxPsalmodyStart === -1 || idxPsalmodyEnd === -1) {
            const lastIndex = (re: RegExp) => {
                let idx = -1; for (let i = 0; i < allChildren.length; i++) if (re.test(textAt(i))) idx = i
                return idx
            }
            const iT = lastIndex(hourNames.tercia)
            const iS = lastIndex(hourNames.sexta)
            const iN = lastIndex(hourNames.noa)
            if (iT === -1) throw new Error('Não foi possível separar as seções (fallback LA/IT/EN).')

            const buildSimple = (a: number, b?: number) => this.cleanHtml(sliceHtml(a, b))
            const tercia = buildSimple(iT, iS !== -1 ? iS : undefined)
            const sexta = iS !== -1 ? buildSimple(iS, iN !== -1 ? iN : undefined) : { html: '', text: '' }
            const noa = iN !== -1 ? buildSimple(iN) : { html: '', text: '' }
            return { title: 'Medium Hour', hour: 'Intermediate Hour', parts: { tercia, sexta, noa } }
        }

        const commonIntroHtml = sliceHtml(idxInvoc, idxHymnus)

        const stopAtComp = (start: number, end: number) => {
            const idxComp = firstIndex(rePsalmodyComplementaris, start)
            return (idxComp !== -1 && idxComp < end) ? idxComp : end
        }
        const psalmodyHtml = sliceHtml(idxPsalmodyStart, stopAtComp(idxPsalmodyStart, idxPsalmodyEnd))

        const hymnFor = (hourRe: RegExp) => {
            const start = firstIndex(hourRe, idxHymnus)
            if (start === -1) return ''
            const end = firstIndex(rePsalmodiaLink, start)
            return sliceHtml(start, (end !== -1 ? end : idxPsalmodyStart))
        }

        const lectioFor = (hourRe: RegExp) => {
            const start = firstIndex(hourRe, idxPsalmodyEnd)
            if (start === -1) return ''
            let end = -1
            for (let i = start + 1; i < allChildren.length; i++) {
                const tag = (allChildren[i] as any).tagName || ''
                const txt = textAt(i)
                if (reHrTag.test(tag)) { end = i; break }
                if (hourRe.source !== hourNames.tercia.source && hourNames.tercia.test(txt)) { end = i; break }
                if (hourRe.source !== hourNames.sexta.source && hourNames.sexta.test(txt)) { end = i; break }
                if (hourRe.source !== hourNames.noa.source && hourNames.noa.test(txt)) { end = i; break }
                if (rePsalmodyComplementaris.test(txt)) { end = i; break }
            }
            return sliceHtml(start, end !== -1 ? end : undefined)
        }

        const buildLa = (hourRe: RegExp) => {
            const hymn = hymnFor(hourRe)
            const lectio = lectioFor(hourRe)
            const full = commonIntroHtml + hymn + psalmodyHtml + lectio
            return this.cleanHtml(full)
        }

        const tercia = buildLa(hourNames.tercia)
        const sexta = buildLa(hourNames.sexta)
        const noa = buildLa(hourNames.noa)

        return { title: 'Medium Hour', hour: 'Intermediate Hour', parts: { tercia, sexta, noa } }
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