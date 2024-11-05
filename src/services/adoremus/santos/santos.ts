import BdPostgres from "../../../database/database"

class ServicoSantos {
    static async informacoes(
        nome?: string,
        conhecido_como?: string,
        nacionalidade?: string,
        martir?: boolean
    ): Promise<any> {
        try {
            let sql = `select * from view_santos where 1=1`
            const parametros: any[] = []

            if (nome) {
                sql += ` and nome like $${parametros.length + 1}`
                parametros.push(`%${nome}%`)
            }

            if (conhecido_como) {
                sql += ` and conhecido_como like $${parametros.length + 1}`
                parametros.push(`%${conhecido_como}%`)
            }

            if (nacionalidade) {
                sql += ` and nacionalidade like $${parametros.length + 1}`
                parametros.push(`%${nacionalidade}%`)
            }

            if (martir !== undefined) {
                sql += ` and martir = $${parametros.length + 1}`
                parametros.push(martir)
            }

            const resultado = await BdPostgres.executar(sql, parametros)

            return resultado
        } catch (err: any) {
            throw new Error(err)
        }
    }
}

export default ServicoSantos