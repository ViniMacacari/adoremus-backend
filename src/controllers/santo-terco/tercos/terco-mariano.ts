import ServicoTercoMariano from "../../../services/santo-terco/database/tercos/mariano.js"

class TercoMariano {
    static async informacoes(): Promise<any> {
        try {
            return await ServicoTercoMariano.informacoes()
        } catch (err: any) {
            throw new Error(err)
        }
    }
}

export default TercoMariano