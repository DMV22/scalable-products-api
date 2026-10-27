import { Controller, Get } from '@nestjs/common';
import { ProductsService } from './products.service';
import { hostname } from 'node:os';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('products')
  getProducts() {
    return {
      instanceId: process.env.INSTANCE_ID ?? hostname(),
      products: this.productsService.findAll(),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('health')
  health() {
    return {
      status: 'ok',
      instanceId: process.env.INSTANCE_ID ?? hostname(),
    };
  }
}
