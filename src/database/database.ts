import { Pool } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

class BdPostgres {
    private static pool: Pool = new Pool({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        idleTimeoutMillis: 30000
    })

    static inicializar(): void {
        this.pool.on('error', (err) => {
            console.error('Erro ao conectar ao banco de dados:', err)
        })
    }

    static async executar(consulta: string, parametros: any[] = []): Promise<any> {
        try {
            const resultado = await this.pool.query(consulta, parametros)
            return resultado.rows
        } catch (err: any) {
            console.error('Erro ao executar a consulta:', err)
            throw new Error('Erro ao executar a consulta')
        }
    }

    static async desconectar(): Promise<void> {
        await this.pool.end()
    }
}

export default BdPostgres