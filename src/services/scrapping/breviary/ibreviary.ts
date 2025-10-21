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

    private async definirDiaAtual(): Promise<void> {
        const { ano, mes, dia } = this.getDataBrasil()
        const body = new URLSearchParams({
            anno: ano.toString(),
            mese: mes.toString(),
            giorno: dia.toString(),
            lang: this.idioma,
            ok: 'ok'
        })
        await this.cliente.post(`${this.base}/opzioni.php`, body, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        })
        await this.cliente.get(`${this.base}/breviario.php`)
    }

    private limparHtml(html: string): string {
        const $ = cheerio.load(html)
        $('script, style, noscript, a[href*="ibreviary.com"], a[href*="donazione"], a[href*="newsletter"]').remove()
        $('p').each((_, el) => {
            const texto = $(el).text().trim()
            if (/DONA|ISCRIVITI|Menu|sostenere lo sviluppo/i.test(texto)) $(el).remove()
        })

        let texto = he
            .decode($.text())
            .replace(/\r?\n|\r/g, '\n')
            .replace(/\n\s*\n+/g, '\n\n')
            .replace(/\s{2,}/g, ' ')
            .trim()

        texto = texto.replace(/\bAmen\b/gi, 'Amém')

        return texto
    }

    private identarTexto(texto: string): string {
        return texto
            .split('\n')
            .map(l => '  ' + l.trim())
            .join('\n')
    }

    async obterHora(hora: Hora): Promise<ResultadoLiturgia> {
        await this.definirDiaAtual()
        const url = `${this.base}/breviario.php?s=${hora}`
        const { data } = await this.cliente.get(url)
        const $ = cheerio.load(data)
        const conteudo = $('#contenuto .inner')
        conteudo.find('h1').each((_, el) => {
            const texto = $(el).html() || ''
            $(el).replaceWith(`<h3>${texto}</h3>`)
        })
        const titulo = conteudo.find('h3').first().text().trim()
        const html = conteudo.html() || ''
        const texto = this.identarTexto(this.limparHtml(html))
        return { titulo, html, texto }
    }

    async obterTodasAsHoras(): Promise<Record<Hora, ResultadoLiturgia>> {
        await this.definirDiaAtual()
        const horas: Hora[] = [
            'ufficio_delle_letture',
            'lodi',
            'ora_media',
            'vespri',
            'compieta'
        ]
        const resultado: Record<Hora, ResultadoLiturgia> = {} as any
        for (const hora of horas) {
            resultado[hora] = await this.obterHora(hora)
        }
        return resultado
    }

    async obterHoraMediaSeparada(): Promise<ResultadoHoraMedia> {
        await this.definirDiaAtual()
        const url = `${this.base}/breviario.php?s=ora_media`
        const { data } = await this.cliente.get(url)
        const $ = cheerio.load(data)
        const conteudo = $('#contenuto .inner')
        conteudo.find('h1').each((_, el) => {
            const texto = $(el).html() || ''
            $(el).replaceWith(`<h3>${texto}</h3>`)
        })
        const titulo = conteudo.find('h3').first().text().trim()
        const htmlCompleto = conteudo.html() || ''
        const textoCompleto = this.limparHtml(htmlCompleto)

        const idxTercia = textoCompleto.search(/Tércia/i)
        const idxSexta = textoCompleto.search(/Sexta/i)
        const idxNoa = textoCompleto.search(/Noa/i)

        const trechoTercia = textoCompleto.slice(idxTercia, idxSexta).trim()
        const trechoSexta = textoCompleto.slice(idxSexta, idxNoa).trim()
        const trechoNoa = textoCompleto.slice(idxNoa).trim()

        return {
            titulo,
            hora: 'Hora Intermédia',
            partes: {
                tercia: {
                    html: htmlCompleto,
                    texto: this.identarTexto(trechoTercia)
                },
                sexta: {
                    html: htmlCompleto,
                    texto: this.identarTexto(trechoSexta)
                },
                noa: {
                    html: htmlCompleto,
                    texto: this.identarTexto(trechoNoa)
                }
            }
        }
    }
}