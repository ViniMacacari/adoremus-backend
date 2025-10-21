import axios from 'axios'
import * as cheerio from 'cheerio'
import he from 'he'
import { CookieJar } from 'tough-cookie'
import { wrapper } from 'axios-cookiejar-support'

type Hora =
    | 'ufficio_delle_letture'
    | 'lodi'
    | 'ora_media'
    | 'vespri'
    | 'compieta'

interface ResultadoLiturgia {
    titulo: string
    html: string
    texto: string
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

        // define a data e o idioma (pt)
        const body = new URLSearchParams({
            anno: ano.toString(),
            mese: mes.toString(),
            giorno: dia.toString(),
            lang: this.idioma,
            ok: 'ok'
        })

        // essa requisição cria o cookie de sessão
        await this.cliente.post(`${this.base}/opzioni.php`, body, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        })

        // esta requisição “ativa” o idioma e data definidos
        await this.cliente.get(`${this.base}/breviario.php`)
    }

    private limparHtml(html: string): string {
        const $ = cheerio.load(html)
        $('script, style, noscript').remove()
        const texto = he
            .decode($.text())
            .replace(/\r?\n|\r/g, '\n')
            .replace(/\n\s*\n+/g, '\n\n')
            .replace(/\s{2,}/g, ' ')
            .trim()
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
        const titulo = conteudo.find('h1').first().text().trim()
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
}