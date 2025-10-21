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
            .replace(/(<br\s*\/?>\s*){3,}/g, '<br>')
            .replace(/\n{2,}/g, '\n')
            .replace(/to support the continued development of the iBreviary/gi, '')
            .replace(/iBreviary newsletter/gi, '')
        $('body').html(content)

        if (this.language.startsWith('pt')) {
            $('p').each((_, el) => {
                $(el).after('<br>')
            })
        }

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

        if (this.language === 'la') {
            return this.buildLatinMediumHour($, content)
        }

        const allChildren = content.children().toArray()

        const hourNames = {
            pt: { tercia: /T[ée]rcia/i, sexta: /Sexta/i, noa: /Noa/i },
            la: { tercia: /\bAD\s+TERTIAM\b/i, sexta: /\bAD\s+SEXTAM\b/i, noa: /\bAD\s+NONAM\b/i },
            it: { tercia: /\bTerza\b/i, sexta: /\bSesta\b/i, noa: /\bNona\b/i },
            en: { tercia: /\bTerce|Midmorning\b/i, sexta: /\bSext|Midday\b/i, noa: /\bNone|Afternoon\b/i },
            es: { tercia: /\bTercia\b/i, sexta: /\bSexta\b/i, noa: /\bNona\b/i }
        }[this.language] || { tercia: /T[ée]rcia/i, sexta: /Sexta/i, noa: /Noa/i }

        const textAt = (i: number) => $(allChildren[i]).text()
        const tagAt = (i: number) => (allChildren[i] as any).tagName || ''
        const sliceHtml = (from: number, to?: number) => allChildren.slice(from, to).map(el => $.html(el)).join('')

        const firstIndex = (re: RegExp, start = 0) => {
            for (let i = start; i < allChildren.length; i++) if (re.test(textAt(i))) return i
            return -1
        }
        const indexOfElem = (sel: string) => {
            const el = content.find(sel).get(0)
            if (!el) return -1
            for (let i = 0; i < allChildren.length; i++) if (allChildren[i] === el) return i
            return -1
        }
        const nextHrAfter = (start: number) => {
            for (let i = start + 1; i < allChildren.length; i++) if (/^hr$/i.test(tagAt(i))) return i
            return -1
        }

        if (['pt', 'es'].includes(this.language)) {
            const idxT = firstIndex(hourNames.tercia)

            if (idxT === -1) {
                console.error(`Não foi possível localizar Tércia (${this.language}).`)
            }

            const idxS = firstIndex(hourNames.sexta, idxT + 1)
            const idxN = idxS === -1 ? -1 : firstIndex(hourNames.noa, idxS + 1)
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

        const idxHymnus = firstIndex(/\bHYMNUS\b/i)
        const idxPsalmA = indexOfElem('a[name="psalm"]')
        const idxLectioA = indexOfElem('a[name="lectio"]')
        const idxCompA = indexOfElem('a[name="comp"]')

        if (idxHymnus === -1 || idxPsalmA === -1 || idxLectioA === -1) {
            const iT = firstIndex(hourNames.tercia)
            if (iT === -1) throw new Error('Não foi possível separar as seções (IT/EN).')
            const iS = firstIndex(hourNames.sexta, iT + 1)
            const iN = iS === -1 ? -1 : firstIndex(hourNames.noa, iS + 1)
            const buildSimple = (a: number, b?: number) => this.cleanHtml(sliceHtml(a, b))
            const tercia = buildSimple(iT, iS !== -1 ? iS : undefined)
            const sexta = iS !== -1 ? buildSimple(iS, iN !== -1 ? iN : undefined) : { html: '', text: '' }
            const noa = iN !== -1 ? buildSimple(iN) : { html: '', text: '' }
            return { title: 'Medium Hour', hour: 'Intermediate Hour', parts: { tercia, sexta, noa } }
        }

        const commonIntroHtml = sliceHtml(0, idxHymnus)

        const hymnFor = (hourRe: RegExp) => {
            const start = firstIndex(hourRe, idxHymnus)
            if (start === -1 || start >= idxPsalmA) return ''
            let end = idxPsalmA
            for (let i = start + 1; i < idxPsalmA; i++) {
                if (/Psalmodia/i.test(textAt(i))) { end = i; break }
            }
            return sliceHtml(start, end)
        }

        const psalmodyEndCandidates = [idxCompA, idxLectioA, nextHrAfter(idxPsalmA)].filter(i => i !== -1)
        const idxPsalmodyEnd = psalmodyEndCandidates.length ? Math.min(...psalmodyEndCandidates) : allChildren.length
        const psalmodyHtml = sliceHtml(idxPsalmA, idxPsalmodyEnd)

        const lectioFor = (hourRe: RegExp) => {
            const start = firstIndex(hourRe, idxLectioA)
            if (start === -1) return ''
            let end = nextHrAfter(start)
            for (let i = start + 1; i < (end === -1 ? allChildren.length : end); i++) {
                const t = textAt(i)
                if (hourRe.source !== hourNames.tercia.source && hourNames.tercia.test(t)) { end = i; break }
                if (hourRe.source !== hourNames.sexta.source && hourNames.sexta.test(t)) { end = i; break }
                if (hourRe.source !== hourNames.noa.source && hourNames.noa.test(t)) { end = i; break }
            }
            return sliceHtml(start, end === -1 ? undefined : end)
        }

        const build = (hourRe: RegExp) => {
            const hymn = hymnFor(hourRe)
            const lectio = lectioFor(hourRe)
            const full = commonIntroHtml + hymn + psalmodyHtml + lectio
            return this.cleanHtml(full)
        }

        const tercia = build(hourNames.tercia)
        const sexta = build(hourNames.sexta)
        const noa = build(hourNames.noa)

        return { title: 'Medium Hour', hour: 'Intermediate Hour', parts: { tercia, sexta, noa } }
    }

    private buildLatinMediumHour($: cheerio.CheerioAPI, content: cheerio.Cheerio<any>): MediumHourResult {
        const nodes = content.children().toArray()
        const textAt = (i: number) => $(nodes[i]).text().replace(/\s+/g, ' ').trim()
        const tagAt = (i: number) => (nodes[i] as any)?.tagName || ''
        const htmlSlice = (a: number, b?: number) => nodes.slice(a, b).map(el => $.html(el)).join('')

        const findText = (re: RegExp, start = 0) => {
            for (let i = start; i < nodes.length; i++) {
                const fullText = $(nodes[i]).text().replace(/\s+/g, ' ').trim()
                if (re.test(fullText)) return i
            }
            return -1
        }

        const nextHrAfter = (start: number) => {
            for (let i = start + 1; i < nodes.length; i++) if (/^hr$/i.test(tagAt(i))) return i
            return -1
        }

        const idxHymnus = (() => {
            const direct = findText(/\bHYMNUS\b/i)
            if (direct !== -1) return direct
            const span = content.find('span:contains("HYMNUS"), font:contains("HYMNUS"), b:contains("HYMNUS")').first()
            if (span.length) {
                for (let i = 0; i < nodes.length; i++) if ($(nodes[i]).find(span).length) return i
            }
            return -1
        })()

        if (idxHymnus === -1) throw new Error('HYMNUS não encontrado para LATIM')

        const idxT = findText(/AD\s*TERTIAM/i, idxHymnus)
        const idxS = findText(/AD\s*SEXTAM/i, idxT + 1)
        const idxN = findText(/AD\s*NONAM/i, idxS + 1)
        const idxComplementaris = findText(/Psalmodia\s+Complementaris/i)

        if (idxT === -1 || idxS === -1 || idxN === -1)
            throw new Error('Estrutura de divisões não encontrada (AD TERTIAM/SEXTAM/NONAM)')

        const introHtml = htmlSlice(0, idxT)
        const hymnT = htmlSlice(idxT, idxS)
        const hymnS = htmlSlice(idxS, idxN)
        const hymnN = htmlSlice(idxN, idxComplementaris !== -1 ? idxComplementaris : undefined)

        const idxAfterHymnus = nextHrAfter(idxHymnus)
        const startIdx = idxAfterHymnus !== -1 ? idxAfterHymnus : idxHymnus + 1
        const psalmodiaCommon = htmlSlice(startIdx, idxComplementaris !== -1 ? idxComplementaris : nodes.length)

        const idxSeriesT = findText(/Series\s+I/i, idxComplementaris)
        const idxSeriesS = findText(/Series\s+II/i, idxSeriesT + 1)
        const idxSeriesN = findText(/Series\s+III/i, idxSeriesS + 1)
        const idxAfterSeries = nextHrAfter(idxSeriesN !== -1 ? idxSeriesN : idxSeriesS !== -1 ? idxSeriesS : idxSeriesT)

        const compT = idxSeriesT !== -1 ? htmlSlice(idxSeriesT, idxSeriesS !== -1 ? idxSeriesS : idxAfterSeries) : ''
        const compS = idxSeriesS !== -1 ? htmlSlice(idxSeriesS, idxSeriesN !== -1 ? idxSeriesN : idxAfterSeries) : ''
        const compN = idxSeriesN !== -1 ? htmlSlice(idxSeriesN, idxAfterSeries) : ''

        const lectio1 = findText(/AD\s*TERTIAM/i, idxComplementaris)
        const lectio2 = findText(/AD\s*SEXTAM/i, lectio1 + 1)
        const lectio3 = findText(/AD\s*NONAM/i, lectio2 + 1)

        const end1 = nextHrAfter(lectio1)
        const end2 = nextHrAfter(lectio2)
        const end3 = nextHrAfter(lectio3)

        const lectioT = lectio1 !== -1 ? htmlSlice(lectio1, end1 !== -1 ? end1 : lectio2) : ''
        const lectioS = lectio2 !== -1 ? htmlSlice(lectio2, end2 !== -1 ? end2 : lectio3) : ''
        const lectioN = lectio3 !== -1 ? htmlSlice(lectio3, end3 !== -1 ? end3 : undefined) : ''

        const build = (hymn: string, lectio: string, comp: string) => {
            const full = introHtml + hymn + psalmodiaCommon + lectio + comp
            return this.cleanHtml(full)
        }

        const tercia = build(hymnT, lectioT, compT)
        const sexta = build(hymnS, lectioS, compS)
        const noa = build(hymnN, lectioN, compN)

        return { title: 'Hora Media', hour: 'Horae mediae', parts: { tercia, sexta, noa } }
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