import BdPostgres from "../../../database/database"

class ServicoSantos {
    static async buscar(): Promise<any> {
        BdPostgres.inicializar()

        const sql = `
            select * from view_oracoes
        `
    }
}

export default ServicoSantos