import axios from 'axios'
import * as cheerio from 'cheerio'
import he from 'he'
import { CookieJar } from 'tough-cookie'
import { wrapper } from 'axios-cookiejar-support'

export type Hora =
    | 'ufficio_delle_letture'
    | 'lodi'
    | 'ora_media'
    | 'vespri'
    | 'compieta'

export interface ResultadoLiturgia {
    titulo: string
    html: string
    texto: string
}

export interface ParteHora {
    html: string
    texto: string
}

export interface ResultadoHoraMedia {
    titulo: string
    hora: string
    partes: {
        tercia: ParteHora
        sexta: ParteHora
        noa: ParteHora
    }
}

export class IBreviaryService {
    private readonly base = 'https://www.ibreviary.com/m2'
    private readonly idioma: string
    private readonly jar = new CookieJar()
    private readonly cliente

    constructor(idioma: string = 'pt') {
        this.idioma = idioma
        this.cliente = wrapper(axios.create({ jar: this.jar, withCredentials: true }))
    }

    private getDataBrasil(): { ano: number; mes: number; dia: number } {
        const agora = new Date()
        const brasil = new Date(agora.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }))
        return {
            ano: brasil.getFullYear(),
            mes: brasil.getMonth() + 1,
            dia: brasil.getDate()
        }
    }

    private async definirDiaAtual(ano?: number, mes?: number, dia?: number): Promise<void> {
        const data = this.getDataBrasil()
        const anoFinal = ano ?? data.ano
        const mesFinal = mes ?? data.mes
        const diaFinal = dia ?? data.dia

        const body = new URLSearchParams({
            anno: anoFinal.toString(),
            mese: mesFinal.toString(),
            giorno: diaFinal.toString(),
            lang: this.idioma,
            ok: 'ok'
        })

        await this.cliente.post(`${this.base}/opzioni.php`, body, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        })
        await this.cliente.get(`${this.base}/breviario.php`)
    }

    private limparHtml(html: string): { html: string; texto: string } {
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

        let content = $('body').html() || ''
        content = content.replace(/&nbsp;/g, ' ')
        content = content
            .replace(/(^|[\s>])V\.\s?/g, '$1℣. ')
            .replace(/(^|[\s>])R\.\s?/g, '$1℟. ')
        $('body').html(content)

        const cleanHtml = he.decode($.html().trim())
        const cleanText = he.decode($.text().replace(/\s{2,}/g, ' ').trim())

        return { html: cleanHtml, texto: cleanText }
    }

    async obterHora(hora: Hora, ano?: number, mes?: number, dia?: number): Promise<ResultadoLiturgia> {
        await this.definirDiaAtual(ano, mes, dia)
        const url = `${this.base}/breviario.php?s=${hora}`
        const { data } = await this.cliente.get(url)
        const $ = cheerio.load(data)
        const conteudo = $('#contenuto .inner')
        const { html: htmlLimpo, texto: textoLimpo } = this.limparHtml(conteudo.html() || '')
        const titulo = conteudo.find('h3').first().text().trim() || hora
        return { titulo, html: htmlLimpo, texto: textoLimpo }
    }

    async obterHoraMediaSeparada(ano?: number, mes?: number, dia?: number): Promise<ResultadoHoraMedia> {
        await this.definirDiaAtual(ano, mes, dia)
        const url = `${this.base}/breviario.php?s=ora_media`
        const { data } = await this.cliente.get(url)
        const $ = cheerio.load(data)
        const conteudo = $('#contenuto .inner')

        const allChildren = conteudo.children().toArray()
        const idxTercia = allChildren.findIndex(el => $(el).text().match(/T[ée]rcia/i))
        const idxSexta = allChildren.findIndex(el => $(el).text().match(/Sexta/i))
        const idxNoa = allChildren.findIndex(el => $(el).text().match(/Noa/i))

        if (idxTercia === -1 || idxSexta === -1 || idxNoa === -1)
            throw new Error('Não foi possível encontrar Tércia, Sexta e Noa no HTML.')

        const getSectionHtml = (start: number, end?: number) => {
            const sectionEls = allChildren.slice(start, end)
            const sectionHtml = sectionEls.map(el => $.html(el)).join('')
            return this.limparHtml(sectionHtml)
        }

        const tercia = getSectionHtml(0, idxSexta)
        const sexta = getSectionHtml(idxSexta, idxNoa)
        const noa = getSectionHtml(idxNoa)

        return {
            titulo: 'Hora Média',
            hora: 'Hora Intermédia',
            partes: {
                tercia,
                sexta,
                noa
            }
        }
    }

    async obterTodasAsHoras(ano?: number, mes?: number, dia?: number): Promise<Record<Hora, ResultadoLiturgia>> {
        await this.definirDiaAtual(ano, mes, dia)
        const horas: Hora[] = [
            'ufficio_delle_letture',
            'lodi',
            'ora_media',
            'vespri',
            'compieta'
        ]
        const resultado: Record<Hora, ResultadoLiturgia> = {} as any
        for (const hora of horas) {
            resultado[hora] = await this.obterHora(hora, ano, mes, dia)
        }
        return resultado
    }
}