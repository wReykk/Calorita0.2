import { type Product } from '../types/product.interface.js';

export class ProductService {
    private mockProducts: Product[] = [
        { id: '1', name: 'Chicken', calories: 113, protein: 23.6, fat: 1.9, carbs: 0.4 },
        { id: '2', name: 'Buckwheat', calories: 108, protein: 4.2, fat: 1.1, carbs: 21.3 },
    ];

    public getAllProducts(): Product[] {
        return this.mockProducts;
    }
    public getProductById(id: string): Product | undefined {
        return this.mockProducts.find(p => p.id === id);
    }

    public createProduct(data: Omit<Product, 'id'>): Product {
        const newProduct: Product = {
            id: Date.now().toString(),
            ...data,
        };
        this.mockProducts.push(newProduct);
        return newProduct;
    }

    public updateProduct(id: string, data: Partial<Omit<Product, 'id'>>): Product | null {
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