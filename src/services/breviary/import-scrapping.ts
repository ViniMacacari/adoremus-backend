import { PostgresDatabase } from "../../database/postgresql.js"
import { IBreviaryService } from "../scrapping/breviary/ibreviary.js"

export class LiturgiaImporter {
    private readonly db: PostgresDatabase
    private readonly ibreviary: IBreviaryService

    constructor() {
        this.db = new PostgresDatabase()
        this.db.init()
        this.ibreviary = new IBreviaryService('pt')
    }

    async importar(
        ciclo_liturgico: number = 3,
        ano?: number,
        mes?: number,
        dia?: number
    ): Promise<void> {
        console.log(`⛪ Iniciando importação da Liturgia das Horas...`)
        this.ibreviary.setLanguage('pt')
        const horas = await this.ibreviary.obterTodasAsHoras(ano, mes, dia)
        const horaMedia = await this.ibreviary.obterHoraMediaSeparada(ano, mes, dia)

        const idioma = 'pt_BR'
        const data = this.getDataBrasil(ano, mes, dia)

        const sql = `
            INSERT INTO liturgia_das_horas
                (oficio_leitura, laudes, tercia, sexta, noa, vesperas, completas, lingua, ciclo_liturgico, dia, mes)
            VALUES
                ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING id
        `

        const params = [
            horas.ufficio_delle_letture.html,
            horas.lodi.html,
            horaMedia.partes.tercia.html,
            horaMedia.partes.sexta.html,
            horaMedia.partes.noa.html,
            horas.vespri.html,
            horas.compieta.html,
            idioma,
            ciclo_liturgico,
            data.dia,
            data.mes
        ]

        try {
            const resultado = await this.db.exec(sql, params)
            console.log(`✅ Liturgia do dia ${data.dia}/${data.mes} inserida com sucesso. ID: ${resultado[0].id}`)
        } catch (erro: any) {
            console.error('❌ Erro ao inserir no banco:', erro.message)
        } finally {
            await this.db.exit()
        }
    }

    private getDataBrasil(
        ano?: number,
        mes?: number,
        dia?: number
    ): { ano: number; mes: number; dia: number } {
        if (ano && mes && dia) return { ano, mes, dia }
        const agora = new Date()
        const brasil = new Date(agora.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }))
        return {
            ano: brasil.getFullYear(),
            mes: brasil.getMonth() + 1,
            dia: brasil.getDate()
        }
    }
}