import { Router } from 'express'
import { GetCategoriesController } from '../controllers/blog/get-categories.js'

export class BlogRouter {
    public readonly router: Router

    private categories: GetCategoriesController = new GetCategoriesController()

    constructor() {
        this.router = Router()
        this.setupRoutes()
    }

    private setupRoutes(): void {
        this.router.get('/categorias', this.categories.get.bind(this.categories))
    }
}