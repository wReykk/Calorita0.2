import { type Product } from '../types/product.interface.js';

export class ProductService {
    private mockProducts: Product[] = [
        {
            id: '1',
            name: 'Sample Product 1',
            price: 19.99,
            description: 'A sample product',
            createdAt: new Date(),
        },
        {
            id: '2',
            name: 'Sample Product 2',
            price: 29.99,
            createdAt: new Date(),
        },
    ];

    public getAllProducts(): Product[] {
        return this.mockProducts;
    }

    public getProductById(id: string): Product | undefined {
        return this.mockProducts.find(p => p.id === id);
    }

    public createProduct(data: Omit<Product, 'id' | 'createdAt'>): Product {
        const newProduct: Product = {
            id: Date.now().toString(),
            ...data,
            createdAt: new Date(),
        };
        this.mockProducts.push(newProduct);
        return newProduct;
    }

    public updateProduct(id: string, data: Partial<Omit<Product, 'id' | 'createdAt'>>): Product | null {
        const index = this.mockProducts.findIndex(p => p.id === id);
        if (index === -1) return null;

        this.mockProducts[index] = {
            ...this.mockProducts[index],
            ...data,
        } as Product;
        return this.mockProducts[index];
    }

    public deleteProduct(id: string): boolean {
        const index = this.mockProducts.findIndex(p => p.id === id);
        if (index === -1) return false;

        this.mockProducts.splice(index, 1);
        return true;
    }
}
