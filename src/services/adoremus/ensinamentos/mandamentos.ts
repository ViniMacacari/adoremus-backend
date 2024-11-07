import BdPostgres from "../../../database/database"

class ServicoMandamentos {
    static async informacoes(
        numero_mandamento?: number,
        descricao_mandamento?: string,
        grupo_mandamento?: string
    ): Promise<any> {
        try {
            const itensPorPagina = 30

            const paginaAtual = 1
            const offset = (paginaAtual - 1) * itensPorPagina

            let sqlBase = `select * from view_mandamentos where 1=1`
            const parametros: any[] = []

            if (numero_mandamento) {
                sqlBase += ` and numero_mandamento = $${parametros.length + 1}`
                parametros.push(numero_mandamento)
            }

            if (descricao_mandamento) {
                sqlBase += ` and descricao_mandamento ilike $${parametros.length + 1}`
                parametros.push(`%${descricao_mandamento}%`)
            }

            if (grupo_mandamento) {
                sqlBase += ` and grupo_mandamento ilike $${parametros.length + 1}`
                parametros.push(`%${grupo_mandamento}%`)
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

export default ServicoMandamentos