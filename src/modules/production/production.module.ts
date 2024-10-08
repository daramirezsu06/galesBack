import { Module } from '@nestjs/common';
import { ProductionController } from './production.controller';
import { ProductionService } from './production.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Production } from '../../entities/production.entity';
import { ProductsModule } from '../products/products.module';
import { ProductionItem } from '../../entities/productionItem.entity';
import { Product } from '../../entities/product.entity';
import { ProductInventories } from 'src/entities/productInventory.entity';
import { ProductionOrder } from '../../entities/productionOrder.entity';
import { ProductionOrderItem } from '../../entities/productionOrderItem.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Production,
      ProductionItem,
      Product,
      ProductInventories,
      ProductionOrder,
      ProductionOrderItem,
    ]),
    ProductsModule,
  ],
  controllers: [ProductionController],
  providers: [ProductionService],
})
export class ProductionModule {}
