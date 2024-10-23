import { Request, Response } from "express"
import ServicoOracoesTerco from "../../../services/santo-terco/oracoes/terco"

class OracoesTerco {
    static async informacoes(req: Request, res: Response): Promise<any> {
        try {
            const resposta = await ServicoOracoesTerco.informacoes()

            return res.status(200).json(resposta)
        } catch (err: any) {
            res.status(500).json({ erro: err.message })
            throw new Error(err)
        }
    }
}

export default OracoesTerco