import { Injectable } from '@nestjs/common';

@Injectable()
export class ProductsService {
  private readonly products = [
    { id: 1, name: 'Brake Pads', price: 45 },
    { id: 2, name: 'Oil Filter', price: 18 },
    { id: 3, name: 'Air Filter', price: 25 },
  ];

  findAll() {
    return this.products;
  }

  generateReport() {
    const startedAt = Date.now();
    const sampleSize = 2_000_000;

    let total = 0;

    for (let i = 1; i <= sampleSize; i++) {
      // Генеруємо й обробляємо значення без великого масиву в пам’яті.
      const value = Math.sqrt(i) * (1 + Math.sin(i) ** 2);
      total += value;
    }

    return {
      sampleSize,
      total,
      mean: total / sampleSize,
      computationMs: Date.now() - startedAt,
    };
  }
}
