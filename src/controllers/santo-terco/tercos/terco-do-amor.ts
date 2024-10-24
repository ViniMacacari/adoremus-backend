import { Request, Response } from "express"
import ServicoTercoAmor from "../../../services/santo-terco/tercos/amor"

class ControllerTercoAmor {
    async informacoes(req: Request, res: Response): Promise<any> {
        try {
            const resposta = await ServicoTercoAmor.informacoes()

            return res.status(200).json(resposta)
        } catch (err: any) {
            res.status(500).json({ erro: err.message })
            throw new Error(err)
        }
    }
}

export default ControllerTercoAmor