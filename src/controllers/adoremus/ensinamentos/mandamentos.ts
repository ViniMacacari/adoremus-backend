import { Request, Response } from "express"
import ServicoMandamentos from "../../../services/adoremus/ensinamentos/mandamentos"

class ControllerMandamentos {
    static async informacoes(req: Request, res: Response): Promise<any> {
        try {
            const { numero_mandamento, descricao_mandamento, grupo_mandamento } = req.query as unknown as {
                numero_mandamento?: number,
                descricao_mandamento?: string,
                grupo_mandamento: string
            }

            const resposta = await ServicoMandamentos.informacoes(
                numero_mandamento,
                descricao_mandamento,
                grupo_mandamento
            )

            return res.status(200).json(resposta)
        } catch (err: any) {
            return res.status(500).json({ erro: err.message })
        }
    }
}

export default ControllerMandamentos