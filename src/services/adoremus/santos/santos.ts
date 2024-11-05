import BdPostgres from "../../../database/database"

class ServicoSantos {
    static async informacoes(
        nome?: string,
        conhecido_como?: string,
        nacionalidade?: string,
        martir?: boolean,
        pagina: number = 1
    ): Promise<any> {
        try {
            const itensPorPagina = 30

            const paginaAtual = isNaN(Number(pagina)) ? 1 : Number(pagina)
            const offset = (paginaAtual - 1) * itensPorPagina

            let sqlBase = `select * from view_santos where 1=1`
            const parametros: any[] = []

            if (nome) {
                sqlBase += ` and nome like $${parametros.length + 1}`
                parametros.push(`%${nome}%`)
            }

            if (conhecido_como) {
                sqlBase += ` and conhecido_como like $${parametros.length + 1}`
                parametros.push(`%${conhecido_como}%`)
            }

            if (nacionalidade) {
                sqlBase += ` and nacionalidade like $${parametros.length + 1}`
                parametros.push(`%${nacionalidade}%`)
            }

            if (martir !== undefined) {
                sqlBase += ` and martir = $${parametros.length + 1}`
                parametros.push(martir)
            }

            const sqlCount = `select count(*) from (${sqlBase}) as total`
            const totalResultado = await BdPostgres.executar(sqlCount, parametros)
            const total = parseInt(totalResultado[0].count, 10)

            const totalPaginas = Math.ceil(total / itensPorPagina)

            const sqlPaginado = `${sqlBase} LIMIT $${parametros.length + 1} OFFSET $${parametros.length + 2}`
            parametros.push(itensPorPagina, offset)

            const resultado = await BdPostgres.executar(sqlPaginado, parametros)

            return {
                total,
                totalPorPagina: resultado.length,
                paginaAtual,
                totalPaginas,
                resultado
            }
        } catch (err: any) {
            throw new Error(err)
        }
    }
}

export default ServicoSantos