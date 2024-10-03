import { Module } from '@nestjs/common';
import { ProductionController } from './production.controller';
import { ProductionService } from './production.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Production } from 'src/entities/production.entity';
import { ProductsModule } from '../products/products.module';
import { ProductionItem } from 'src/entities/productionItem.entity';
import { Product } from 'src/entities/product.entity';
import { ProductInventories } from 'src/entities/productInventory';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Production,
      ProductionItem,
      Product,
      ProductInventories,
    ]),
    ProductsModule,
  ],
  controllers: [ProductionController],
  providers: [ProductionService],
})
export class ProductionModule {}
