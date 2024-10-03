import { Module } from '@nestjs/common';
import { ProductsService } from './services/products.service';
import { ProductsController } from './controllers/products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from 'src/entities/product.entity';
import { Category } from 'src/entities/category.entity';
import { Brand } from 'src/entities/brand.entity';
import { OrderDetail } from 'src/entities/orderDetail.entity';
import { ProductsAttributeController } from './controllers/productAttribute.controller';
import { ProductsAttributeService } from './services/productAttribute.service';
import { Attribute } from 'src/entities/attribute.entity';
import { ProductAttribute } from 'src/entities/productAttributes.entity';
import { ProductImagesController } from './controllers/productImages.controller';
import { ProductImagesService } from './services/productImages.service';
import { ProductImages } from 'src/entities/productImages';
import { ProductInventories } from 'src/entities/productInventory';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      Category,
      Brand,
      OrderDetail,
      Attribute,
      ProductAttribute,
      ProductImages,
      ProductInventories,
    ]),
  ],
  controllers: [
    ProductsController,
    ProductsAttributeController,
    ProductImagesController,
  ],
  providers: [ProductsService, ProductsAttributeService, ProductImagesService],
  exports: [ProductsService, ProductsAttributeService],
})
export class ProductsModule {}
