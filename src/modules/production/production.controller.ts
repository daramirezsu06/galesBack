import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  CreateProductionDto,
  CreateProductionOrderDto,
} from './production.dto';
import { ProductionService } from './production.service';

@Controller('production')
export class ProductionController {
  constructor(private productionServices: ProductionService) {}
  @Post()
  crateProduction(@Body() productionData: CreateProductionDto) {
    return this.productionServices.create(productionData);
  }
  @Post('order')
  createProductionOrder(@Body() productionOderData: CreateProductionOrderDto) {
    return this.productionServices.CreteProductionOrder(productionOderData);
  }

  @Get('orders')
  getAllOrders() {
    return this.productionServices.findAllOrders();
  }
}
