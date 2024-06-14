import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { Role } from './models/roles.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import {
  loadUsers,
  loadCategories,
  loadBrands,
  loadProducts,
} from './utils/loadData';
import { CategoriesService } from './modules/categories/categories.service';
import { BrandService } from './modules/brands/brands.service';
import { ProductsService } from './modules/products/products.service';

@Injectable()
export class SeederService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly categoryService: CategoriesService,
    private readonly brandService: BrandService,
    private readonly productsService: ProductsService,
  ) {}

  async seed() {
    console.log('PRELOAD DATA');

    const users = await this.usersRepository.find();
    if (users.length > 0) {
      console.log('Preload ready');
      return;
    }

    await this.preloadAdminUser();
    await this.preloadUsers();
    // await this.preloadEmployeeUser();
    await this.preloadCategories();
    await this.preloadBrands();
    await this.preloadProducts();
  }

  async preloadAdminUser() {
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

    const adminUser = {
      name: process.env.ADMIN_NAME,
      phone: process.env.ADMIN_PHONE,
      email: process.env.ADMIN_EMAIL,
      identification: process.env.ADMIN_IDENTIFICATION,
      password: hashedPassword,
      role: Role.ADMIN,
    };
    return await this.usersRepository.save(adminUser);
  }

  async preloadUsers() {
    const users = loadUsers();
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

    for await (const user of users) {
      await this.usersRepository.save({ ...user, password: hashedPassword });
    }
    return true;
  }

  async preloadCategories() {
    const categories = loadCategories();
    for await (const category of categories) {
      await this.categoryService.create(category);
    }
    return true;
  }

  async preloadBrands() {
    const brands = loadBrands();
    for await (const brand of brands) {
      await this.brandService.create(brand);
    }
    return true;
  }

  async preloadProducts() {
    const products = loadProducts();
    for await (const product of products) {
      const category = await this.categoryService.findOneByName(
        product.category,
      );
      const brand = await this.brandService.findOneByName(product.brand);

      await this.productsService.create({
        ...product,
        brand: brand,
        categories: [category],
      });
    }
    return true;
  }
}
