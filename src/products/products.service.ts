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
}
