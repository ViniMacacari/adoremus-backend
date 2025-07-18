import pg from 'pg'
import type { Pool as PoolType } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

export class PostgresDatabase {
    private pool: PoolType = new pg.Pool({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        idleTimeoutMillis: 30000
    })

    init(): void {
        this.pool.on('error', (err: any) => {
            console.error('Erro ao conectar ao banco de dados:', err)
        })
    }

    async exec(sql: string, params: any[] = []): Promise<any> {
        try {
            const resultado = await this.pool.query(sql, params)
            return resultado.rows
        } catch (err: any) {
            console.error('Erro ao executar a consulta:', err)
            throw new Error(err)
        }
    }

    async exit(): Promise<void> {
        await this.pool.end()
    }
}