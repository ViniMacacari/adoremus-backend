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

    private async definirDiaAtual(
        ano?: number,
        mes?: number,
        dia?: number
    ): Promise<void> {
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

    // HTML puro, apenas limpo (sem alterar estrutura)
    private limparHtml(html: string): { html: string; texto: string } {
        const $ = cheerio.load(html)

        // Remove scripts, estilos e blocos desnecessários
        $('script, style, noscript, header, footer, nav').remove()
        $('a[href*="donazione"], a[href*="newsletter"], a[href*="ibreviary.com"]').remove()

        // Remove cabeçalhos redundantes (Breviário, Laudes etc.)
        $('h1, h2, h3').each((_, el) => {
            const t = $(el).text().trim()
            if (/breviário|breviario|laudes|ofício|compieta|vesperas|tércia|sexta|noa/i.test(t))
                $(el).remove()
        })

        // Remove spans/font inúteis, preservando o texto e estrutura
        $('span, font').each((_, el) => {
            const node = $(el)
            node.replaceWith(node.html() || node.text())
        })

        // Decodifica entidades HTML, mantendo estrutura
        const cleanHtml = he.decode($.html().trim())

        // Cria versão texto simples (para salvar no banco, se precisar)
        const cleanText = he.decode($.text().trim())

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
        const { html: htmlLimpo, texto: textoCompleto } = this.limparHtml(conteudo.html() || '')

        const idxTercia = textoCompleto.search(/Tércia/i)
        const idxSexta = textoCompleto.search(/Sexta/i)
        const idxNoa = textoCompleto.search(/Noa/i)

        const trechoTercia = textoCompleto.slice(idxTercia, idxSexta).trim()
        const trechoSexta = textoCompleto.slice(idxSexta, idxNoa).trim()
        const trechoNoa = textoCompleto.slice(idxNoa).trim()

        return {
            titulo: 'Hora Média',
            hora: 'Hora Intermédia',
            partes: {
                tercia: { html: htmlLimpo, texto: trechoTercia },
                sexta: { html: htmlLimpo, texto: trechoSexta },
                noa: { html: htmlLimpo, texto: trechoNoa }
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