import { Request, Response } from "express"
import ServicoPostagens from "../../../services/adoremus/ensinamentos/postagens"

class ControllerPostagens {
    static async informacoes(req: Request, res: Response): Promise<any> {
        try {
            const { id, titulo, subtitulo, pagina } = req.query as unknown as {
                id?: number,
                titulo?: string,
                subtitulo: string,
                pagina: number
            }

            const resposta = await ServicoPostagens.informacoes(
                id,
                titulo,
                subtitulo,
                pagina
            )

            return res.status(200).json(resposta)
        } catch (err: any) {
            return res.status(500).json({ erro: err.message })
        }
    }
}

export default ControllerPostagens