import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
// import * as Joi from 'joi';

import { DatabseModule } from './database/database.module';
import { UsersModule } from './modules/users/users.module';
import { environments } from './environments';
import { AuthModule } from './modules/auth/auth.module';
import config from './config';
import { JwtModule } from '@nestjs/jwt';
import { SeederService } from './seeder.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { FilesModule } from './modules/files/files.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { Category } from './entities/category.entity';
import { ProductsModule } from './modules/products/products.module';
import { BrandsModule } from './modules/brands/brands.module';
import { AttributesModule } from './modules/attributes/attributes.module';
import { OrdersModule } from './modules/orders/orders.module';
import { ProductsAttributeController } from './modules/products/controllers/productAttribute.controller';
import { SettingsModule } from './modules/settings/settings.module';
import { ProductionModule } from './modules/production/production.module';
import { FormulationsModule } from './modules/formulations/formulations.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: environments[process.env.NODE_ENV] || '.env',

      load: [config],
      isGlobal: true,
      // validationSchema: Joi.object({
      //   POSTGRES_HOST: Joi.string().required(),
      //   POSTGRES_PORT: Joi.number().required(),
      //   POSTGRES_DB: Joi.string().required(),
      //   POSTGRES_USER: Joi.string().required(),
      //   POSTGRES_PASSWORD: Joi.string().required(),
      // }),
    }),
    TypeOrmModule.forFeature([User, Category]),
    DatabseModule,
    UsersModule,
    AuthModule,
    OrdersModule,
    FilesModule,
    JwtModule.register({
      global: true,
      // signOptions: { expiresIn: '1h' },
      secret: process.env.JWT_SECRET,
    }),
    CategoriesModule,
    ProductsModule,
    BrandsModule,
    AttributesModule,
    SettingsModule,
    ProductionModule,
    FormulationsModule,
  ],
  controllers: [AppController, ProductsAttributeController],
  providers: [AppService, SeederService],
})
export class AppModule {
  constructor(private readonly seederService: SeederService) {
    this.seederService.seed();
    console.log({
      dbHost: process.env.POSTGRES_HOST,
      dbPort: parseInt(process.env.POSTGRES_PORT, 10),
      dbName: process.env.POSTGRES_DB,
      dbUser: process.env.POSTGRES_USER,
      dbPass: process.env.POSTGRES_PASSWORD,
    });
  }
}
