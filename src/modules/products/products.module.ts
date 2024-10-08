import { Module } from '@nestjs/common';
import { ProductsService } from './services/products.service';
import { ProductsController } from './controllers/products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../../entities/product.entity';
import { Category } from '../../entities/category.entity';
import { Brand } from '../../entities/brand.entity';
import { OrderDetail } from '../../entities/orderDetail.entity';
import { ProductsAttributeController } from './controllers/productAttribute.controller';
import { ProductsAttributeService } from './services/productAttribute.service';
import { Attribute } from '../../entities/attribute.entity';
import { ProductAttribute } from '../../entities/productAttributes.entity';
import { ProductImagesController } from './controllers/productImages.controller';
import { ProductImagesService } from './services/productImages.service';
import { ProductImages } from '../../entities/productImages.entity';
import { ProductInventories } from '../../entities/productInventory.entity';

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
