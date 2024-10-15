import { Request, Response } from "express"
import ServicoTercoMariano from "../../../services/santo-terco/tercos/mariano.js"

class TercoMariano {
    static async informacoes(req: Request, res: Response): Promise<any> {
        try {
            const resposta = await ServicoTercoMariano.informacoes()

            return res.status(200).json(resposta)
        } catch (err: any) {
            res.status(500).json({ erro: err.message })
            throw new Error(err)
        }
    }
}

export default TercoMariano