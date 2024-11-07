import BdPostgres from "../../../database/database"

class ServicoPostagens {
    static async informacoes(
        id?: number,
        titulo?: string,
        subtitulo?: string,
        pagina: number = 1
    ): Promise<any> {
        try {
            const itensPorPagina = 30

            const paginaAtual = isNaN(Number(pagina)) ? 1 : Number(pagina)
            const offset = (paginaAtual - 1) * itensPorPagina

            let sqlBase = `select * from view_postagens where 1=1`
            const parametros: any[] = []

            if (id) {
                sqlBase += ` and id = $${parametros.length + 1}`
                parametros.push(id)
            }

            if (titulo) {
                sqlBase += ` and titulo like $${parametros.length + 1}`
                parametros.push(`%${titulo}%`)
            }

            if (subtitulo) {
                sqlBase += ` and subtitulo like $${parametros.length + 1}`
                parametros.push(`%${subtitulo}%`)
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

export default ServicoPostagens