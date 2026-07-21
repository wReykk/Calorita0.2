import { type Product } from '../types/product.interface.js';

export class ProductService {
    private mockProducts: Product[] = [
        { id: '1', name: 'Chicken', calories: 113, protein: 23.6, fat: 1.9, carbs: 0.4 },
        { id: '2', name: 'Buckwheat', calories: 108, protein: 4.2, fat: 1.1, carbs: 21.3 },
    ];

    public getAllProducts(): Product[] {
        return this.mockProducts;
    }

}