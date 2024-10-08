import { Injectable } from '@nestjs/common';
import { CreateProductImagesDto } from '../dtos/productImages.dto';
import { ProductsService } from './products.service';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductImages } from 'src/entities/productImages.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProductImagesService {
  constructor(
    @InjectRepository(ProductImages)
    private prodImagesRepository: Repository<ProductImages>,
    private productService: ProductsService,
  ) {}

  async create(data: CreateProductImagesDto) {
    const productImages = new ProductImages();

    const product = await this.productService.findOne(data.productId);
    productImages.secureUrl = data.secureUrl;
    productImages.product = product;

    return await this.prodImagesRepository.save(productImages);
  }

  async remove(id: string) {
    await this.prodImagesRepository.delete(id);
    return id;
  }
}
