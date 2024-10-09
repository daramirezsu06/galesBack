import { Module } from '@nestjs/common';
import { BrandService } from './brands.service';
import { BrandsController } from './brands.controller';
import { Brand } from '../../entities/brand.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Brand])],
  controllers: [BrandsController],
  providers: [BrandService],
  exports: [BrandService],
})
export class BrandsModule {}
