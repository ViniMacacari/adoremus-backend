import BdPostgres from "../../../database/database"

class ServicoSantos {
    static async buscar(): Promise<any> {

        try {
            const sql = `
                select * from view_santos
            `

            const resultado = await BdPostgres.executar(sql)

            return resultado
        } catch (err: any) {
            throw new Error(err)
        }
    }
}

export default ServicoSantos