import BdPostgres from '../../../database/database.js'

class ServicoTercoAmor {
    static async informacoes(): Promise<any> {
        try {
            BdPostgres.inicializar()

            const sql = 'SELECT * FROM view_oracoes_terco_amor'

            const resultado = await BdPostgres.executar(sql)

            return resultado
        } catch (err: any) {
            throw new Error(err)
        }
    }
}

export default ServicoTercoAmor