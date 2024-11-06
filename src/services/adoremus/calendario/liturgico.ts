import BdPostgres from "../../../database/database"

class ServicoCalendarioLiturgico {
    static async informacoes(
        ano: number
    ): Promise<any> {
        try {
            let sqlBase = `
                select *
                from calendario_liturgico($1)
                order by 2
            `
            const parametros = [ano]

            if (!ano) {
                throw 'Você deve informar o ano requisitado!'
            }

            const sqlCount = `select count(*) from (${sqlBase}) as total`
            const totalResultado = await BdPostgres.executar(sqlCount, parametros)
            const total = parseInt(totalResultado[0].count, 10)

            const totalPaginas = 1
            const paginaAtual = 1

            const resultado = await BdPostgres.executar(sqlBase, parametros)

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

export default ServicoCalendarioLiturgico