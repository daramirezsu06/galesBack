import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
  ParseEnumPipe,
  SerializeOptions,
} from '@nestjs/common';
import { ProductsService } from '../services/products.service';
import { CreateProductDto, UpdateProductDto } from '../dtos/product.dto';
import { UUID } from 'crypto';
import { ApiQuery } from '@nestjs/swagger';
import { ProductStatus } from 'src/models/productStatus.enum';
import { AddInventory } from '../dtos/inventori.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }
  @Post('addInventory')
  addInventory(@Body() addInventory: AddInventory) {
    return this.productsService.CreateInventoryTransaction(addInventory);
  }
  @Get()
  @ApiQuery({ name: 'status', required: false })
  @SerializeOptions({ groups: ['findAll'] })
  findAll(
    @Query('status', new ParseEnumPipe(ProductStatus, { optional: true }))
    status?: ProductStatus,
    @Query('types') types?: string,
  ) {
    const typesToFilter = types ? types.split(',') : [];
    return this.productsService.findAll(status, typesToFilter);
  }

  @Get('find-by-slug/:slug')
  @SerializeOptions({ groups: ['findOne'] })
  findOneByName(@Param('slug') slug: string) {
    return this.productsService.findOneBySlug(slug);
  }

  @Get(':id')
  @SerializeOptions({ groups: ['findOne'] })
  findOne(@Param('id', ParseUUIDPipe) id: UUID) {
    return this.productsService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseUUIDPipe) id: UUID,
    @Body() changes: UpdateProductDto,
  ) {
    return this.productsService.update(id, changes);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: UUID) {
    return this.productsService.remove(id);
  }
}
