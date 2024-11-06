import { Request, Response } from "express"
import ServicoConexao from "../../../services/adoremus/abrir-conexao/abrir"

class ControllerConexao {
    static async informacoes(req: Request, res: Response): Promise<any> {
        try {
            const resposta = await ServicoConexao.informacoes()

            return res.status(200).json(resposta)
        } catch (err: any) {
            return res.status(500).json({ erro: err.message })
        }
    }
}

export default ControllerConexao