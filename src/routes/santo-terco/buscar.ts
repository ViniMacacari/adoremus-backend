import { Router } from 'express'
import path from 'path'
import fs from 'fs'

class RotaBuscarSantoTerco {
    public router: Router

    constructor() {
        this.router = Router()
        this.carregarControladores()
    }

    private carregarControladores() {
        const caminhoControladores = path.join(__dirname, '../../controllers/santo-terco')
        this.carregarControladoresRecursivamente(caminhoControladores, '/buscar')
    }

    private carregarControladoresRecursivamente(diretorioBase: string, rotaBase: string) {
        const arquivos = fs.readdirSync(diretorioBase)

        arquivos.forEach((arquivo) => {
            const caminhoCompleto = path.join(diretorioBase, arquivo)
            const stats = fs.statSync(caminhoCompleto)

            if (stats.isDirectory()) {
                const novaRotaBase = `${rotaBase}/${arquivo}`
                this.carregarControladoresRecursivamente(caminhoCompleto, novaRotaBase)
            } else if (stats.isFile() && (arquivo.endsWith('.js') || arquivo.endsWith('.ts'))) {
                const nomeArquivo = arquivo.replace(/\.(js|ts)$/, '')
                const urlArquivoTS = `file://${caminhoCompleto.replace(/\\/g, '/')}`
                const urlArquivoJS = `file://${caminhoCompleto.replace(/\\/g, '/').replace(/\.ts$/, '.js')}`

                import(urlArquivoTS)
                    .then((controlador) => {
                        if (controlador.default && typeof controlador.default.informacoes === 'function') {
                            this.router.get(`${rotaBase}/${nomeArquivo}`, async (req, res) => {
                                try {
                                    const dados = await controlador.default.informacoes()
                                    res.status(200).json(dados)
                                } catch (err: any) {
                                    res.status(500).json({ erro: err.message })
                                }
                            })
                        } else {
                            console.error(`Controlador ${nomeArquivo} não possui a função informacoes`)
                        }
                    })
                    .catch(() => {
                        import(urlArquivoJS)
                            .then((controlador) => {
                                if (controlador.default && typeof controlador.default.informacoes === 'function') {
                                    this.router.get(`${rotaBase}/${nomeArquivo}`, async (req, res) => {
                                        try {
                                            const dados = await controlador.default.informacoes()
                                            res.status(200).json(dados)
                                        } catch (err: any) {
                                            res.status(500).json({ erro: err.message })
                                        }
                                    })
                                } else {
                                    console.error(`Controlador ${nomeArquivo} não possui a função informacoes`)
                                }
                            })
                            .catch((err) => {
                                console.error(`Erro ao importar o controlador ${nomeArquivo} como JS:`, err)
                            })
                    })
            }
        })
    }
}

export default new RotaBuscarSantoTerco().router