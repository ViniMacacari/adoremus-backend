import BdPostgres from "../../../database/database"

class ServicoConexao {
    static async informacoes(): Promise<any> {
        try {
            let sqlBase = `
                select 'conectado' as resposta
            `

            const resultado = await BdPostgres.executar(sqlBase)

            return {
                resultado
            }
        } catch (err: any) {
            throw new Error(err)
        }
    }
}

export default ServicoConexao