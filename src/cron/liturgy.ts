import cron from 'node-cron'
import { ImportDiaryLiturgy } from '../services/import/diary-liturgy.js'

export class LiturgyScheduler {
    start(): void {
        cron.schedule('0 0 * * *', async () => {
            console.log('Iniciando importação da liturgia diária às 00:00...')
            const importer = new ImportDiaryLiturgy()
            await importer.import()
        })

        console.log('Agendamento configurado para rodar todos os dias às 00:00')
    }

    async runNow(): Promise<void> {
        console.log('Executando importação imediatamente...')
        const importer = new ImportDiaryLiturgy()
        await importer.import()
    }
}