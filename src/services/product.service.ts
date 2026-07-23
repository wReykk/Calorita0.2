import { type Product } from '../types/product.interface.js';
import { prisma } from '../prisma/prisma.config.js'

export class ProductService {

    public async getAllProducts() {
        return await prisma.product.findMany()
    }

    public async getProductById(id: string) {
        return await prisma.product.findUnique({ where: { id: id } })
    }

    public async createProduct(data: { name: string; price: number; description?: string }) {
        return await prisma.product.create({ data: data })
    }

    public async updateProduct(id: string, data: { name: string; price: number; description?: string }) {
        return await prisma.product.update({ where: { id: id }, data: data })
    }

    public async deleteProduct(id: string) {
        await prisma.product.delete({ where: { id: id } })
    }
}
