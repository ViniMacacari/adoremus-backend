import { Request, Response } from "express"
import ServicoCalendarioLiturgico from "../../../services/adoremus/calendario/liturgico"

class ControllerCalendarioLiturgico {
    static async informacoes(req: Request, res: Response): Promise<any> {
        try {
            const { ano } = req.query as {
                ano?: number
            }

            const resposta = await ServicoCalendarioLiturgico.informacoes(
                ano as number
            )

            return res.status(200).json(resposta)
        } catch (err: any) {
            return res.status(500).json({ erro: err.message })
        }
    }
}

export default ControllerCalendarioLiturgico