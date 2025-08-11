import { Router } from 'express'
import { GetCategoriesController } from '../controllers/blog/get-categories.js'
import { BlogController } from '../controllers/blog/get-blog-post.js'

export class BlogRouter {
    public readonly router: Router

    private categories: GetCategoriesController = new GetCategoriesController()
    private blog: BlogController = new BlogController()

    constructor() {
        this.router = Router()
        this.setupRoutes()
    }

    private setupRoutes(): void {
        this.router.get('/categorias', this.categories.get.bind(this.categories))
        this.router.get('/postagens', this.blog.getPosts.bind(this.blog))
    }
}