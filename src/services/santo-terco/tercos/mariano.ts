import BdPostgres from '../../../database/database.js'

class ServicoTercoMariano {
    static async informacoes(): Promise<any> {
        try {
            BdPostgres.inicializar()

            console.log('entro aqui tbm')

            const sql = 'SELECT * FROM view_terco'

            const resultado = await BdPostgres.executar(sql)

            return resultado
        } catch (err: any) {
            throw new Error(err)
        }
    }
}

export default ServicoTercoMariano