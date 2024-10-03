import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateProductDto, UpdateProductDto } from '../dtos/product.dto';
import { UUID } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/entities/product.entity';
import {
  FindOptionsOrderValue,
  FindOptionsWhere,
  In,
  Repository,
} from 'typeorm';
import { Category } from 'src/entities/category.entity';
import { Brand } from 'src/entities/brand.entity';
import { ProductInventories } from 'src/entities/productInventory';
import { AddInventory } from '../dtos/inventori.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Brand)
    private brandRepository: Repository<Brand>,
    @InjectRepository(ProductInventories)
    private inventoryRepository: Repository<ProductInventories>,
  ) {}

  async create(data: CreateProductDto) {
    const productDB = await this.findOneByName(data.name);
    if (productDB) throw new BadRequestException('El producto ya existe');

    const product = this.productRepository.create(data);

    if (data.brandId) {
      const brand = await this.brandRepository.findOne({
        where: { id: data.brandId },
      });
      product.brand = brand;
    }

    if (data.categoriesIds) {
      const categories = await this.categoryRepository.findBy({
        id: In(data.categoriesIds),
      });
      product.categories = categories;
    }

    const newProduct = await this.productRepository.save(product);
    return newProduct;
  }

  async findAll(status?, typesToFilter: string[] = []) {
    const where: FindOptionsWhere<Product> = {};

    // Filtra por status si está presente
    if (status) {
      where.status = status;
    }

    // Si hay tipos a filtrar, añadimos una condición adicional
    if (typesToFilter.length > 0) {
      where.productType = In(typesToFilter); // 'In' es un operador de TypeORM para buscar por lista
    }

    const conditions: any = {
      where,
      order: { updatedAt: 'DESC' as FindOptionsOrderValue },
      relations: ['categories', 'brand'],
    };

    const products = await this.productRepository.find(conditions);
    return products;
  }

  async findOne(id: UUID) {
    const productDb = await this.productRepository.findOne({
      where: { id },
      relations: [
        'categories',
        'brand',
        'attributes',
        'attributes.attribute',
        'images',
      ],
    });
    if (!productDb) throw new BadRequestException('Producto inexistente');
    return productDb;
  }

  async findOneByName(name: string) {
    const product = await this.productRepository.findOneBy({ name });
    return product;
  }

  async findOneBySlug(slug: string) {
    const product = await this.productRepository.findOne({
      where: { slug },
      relations: [
        'categories',
        'brand',
        'attributes',
        'attributes.attribute',
        'images',
      ],
    });
    return product;
  }

  async removeCategoryByProd(productId: UUID, categoryId: UUID) {
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: ['categories'],
    });
    product.categories = product.categories.filter(
      (item) => item.id !== categoryId,
    );

    return this.productRepository.save(product);
  }

  async addCategoryToProd(productId: UUID, categoryId: UUID) {
    const product = await this.productRepository.findOne({
      where: { id: productId },
      relations: ['categories'],
    });

    const category = await this.categoryRepository.findOneBy({
      id: categoryId,
    });
    product.categories.push(category);
    return this.productRepository.save(product);
  }

  async update(id: UUID, changes: UpdateProductDto) {
    const product = await this.findOne(id);

    // Si hay cambio de marca
    if (changes.brandId) {
      const brand = await this.brandRepository.findOne({
        where: { id: changes.brandId },
      });
      product.brand = brand;
    }

    // Si hay cambios en categorías
    // Esto funciona pero desde el front siempre
    // se debe enviar todas las categorías.

    // Una buena práctica para el manejo de arrays es
    // separarlo en un método diferente
    // y generar endpoints para agregar o quitar categorias
    if (changes.categoriesIds) {
      const categories = await this.categoryRepository.findBy({
        id: In(changes.categoriesIds),
      });
      product.categories = categories;
    }

    this.productRepository.merge(product, changes);
    return this.productRepository.save(product);
  }

  async remove(id: UUID) {
    await this.findOne(id);
    await this.productRepository.delete(id);
    return id;
  }

  async CreateInventoryTransaction(data: AddInventory) {
    const { date, quantity, reason, cost, observation, productId } = data;

    // Buscar el producto
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new BadRequestException('Producto no encontrado');
    }

    // Crear la transacción de inventario
    const inventoryTransaction = this.inventoryRepository.create({
      date,
      quantity,
      reason,
      cost,
      observation,
      product,
    });

    // Calcular el nuevo stock y costo ponderado
    const totalQuantity = quantity + product.stock;
    const ponderedNewCost =
      (quantity / totalQuantity) * cost +
      (product.stock / totalQuantity) * product.cost;

    // Actualizar el producto
    product.stock = totalQuantity;
    product.cost = ponderedNewCost;

    // Guardar las transacciones en paralelo
    const [productUpdate, newInventory] = await Promise.all([
      this.productRepository.save(product),
      this.inventoryRepository.save(inventoryTransaction),
    ]);

    return { productUpdate, newInventory };
  }
}
