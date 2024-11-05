import { Request, Response } from "express"
import ServicoSantos from "../../../services/adoremus/santos/santos"

class ControllerSantos {
    static async informacoes(req: Request, res: Response): Promise<any> {
        try {
            const { nome, conhecido_como, nacionalidade, martir } = req.query as {
                nome?: string,
                conhecido_como?: string,
                nacionalidade?: string,
                martir?: boolean
            }

            const resposta = await ServicoSantos.informacoes(
                nome,
                conhecido_como,
                nacionalidade,
                martir
            )

            return res.status(200).json(resposta)
        } catch (err: any) {
            res.status(500).json({ erro: err.message })
            throw new Error(err)
        }
    }
}

export default ControllerSantos