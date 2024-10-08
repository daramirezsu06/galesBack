import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UUID } from 'crypto';
import { Production } from 'src/entities/production.entity';
import { ProductionItem } from 'src/entities/productionItem.entity';
import { Repository, QueryFailedError } from 'typeorm';
import {
  CreateProductionDto,
  CreateProductionOrderDto,
} from './production.dto';
import { Product } from 'src/entities/product.entity';
import { ProductInventories } from 'src/entities/productInventory.entity';
import { ProductionOrder } from 'src/entities/productionOrder.entity';
import { ProductionOrderItem } from 'src/entities/productionOrderItem.entity';
import { ProductionOrderStatus } from 'src/models/productionEstatus.enum';

@Injectable()
export class ProductionService {
  constructor(
    @InjectRepository(Production)
    private productionRepo: Repository<Production>,
    @InjectRepository(ProductionItem)
    private productionItemRepo: Repository<ProductionItem>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(ProductInventories)
    private inventoriesRepo: Repository<ProductInventories>,
    @InjectRepository(ProductionOrder)
    private productionOrderRepo: Repository<ProductionOrder>,
    @InjectRepository(ProductionOrderItem)
    private productionOrderItemRepo: Repository<ProductionOrderItem>,
  ) {}

  async findAll() {
    return await this.productionRepo.find({
      relations: ['productionItems', 'productionItems.product'],
    });
  }

  async findOne(id: UUID) {
    const production = await this.productionRepo.findOne({
      where: { id },
      relations: ['productionItems', 'productionItems.product'],
    });

    if (!production) {
      throw new NotFoundException(`Production with ID ${id} not found.`);
    }

    return production;
  }
  async findAllOrders() {
    return await this.productionOrderRepo.find({
      relations: ['productionOrderItems', 'product'],
    });
  }

  private calculateItemCost(item, productItem): number {
    return item.quantity * productItem.cost;
  }

  async CreteProductionOrder(data: CreateProductionOrderDto) {
    const queryRunner =
      this.productionOrderRepo.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { productId, productionItems = [], quantityProduced } = data;

      // Validación del producto principal
      const product = await this.productRepo.findOne({
        where: { id: productId },
      });
      if (!product)
        throw new NotFoundException(`Product with ID ${productId} not found.`);
      if (quantityProduced <= 0)
        throw new BadRequestException(
          `The quantityProduced must be greater than 0.`,
        );

      // Crear la orden de producción principal
      const productionOrder = this.productionOrderRepo.create({
        product,
        quantityProduced,
        status: ProductionOrderStatus.IN_PROCESS,
      });

      // Guardar primero la orden de producción
      await queryRunner.manager.save(productionOrder);

      // Obtener todos los productos de los productionItems de una sola vez
      const productIds = productionItems.map((item) => item.productId);
      const products = await this.productRepo.findByIds(productIds);

      // Crear y guardar los ítems de la orden de producción
      const items = [];
      for (const item of productionItems) {
        const productItem = products.find((p) => p.id === item.productId);

        if (!productItem)
          throw new NotFoundException(
            `Product item with ID ${item.productId} not found.`,
          );
        if (item.quantity <= 0)
          throw new BadRequestException(`The quantity must be greater than 0.`);

        // Crear ProductionOrderItem
        const productionOrderItem = this.productionOrderItemRepo.create({
          product: productItem,
          quantityUsed: item.quantity,
          productionOrder, // Aquí ya puedes asociar el productionOrder guardado
        });
        items.push(productionOrderItem);
      }

      // Guardar los ítems de la orden de producción
      await queryRunner.manager.save(items);

      // Confirmar la transacción si todo salió bien
      await queryRunner.commitTransaction();
    } catch (error) {
      // Revertir la transacción en caso de error
      await queryRunner.rollbackTransaction();

      if (error instanceof QueryFailedError) {
        throw new BadRequestException('Database error: ' + error.message);
      } else {
        throw new InternalServerErrorException(
          `Error creating production order: ${error.message}`,
        );
      }
    } finally {
      // Asegurarse de liberar el queryRunner
      await queryRunner.release();
    }
  }

  async create(data: CreateProductionDto) {
    const queryRunner =
      this.productionRepo.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { productId, productionItems = [], quantityProduced } = data;

      // Validación del producto principal
      const product = await this.productRepo.findOne({
        where: { id: productId },
      });
      if (!product)
        throw new NotFoundException(`Product with ID ${productId} not found.`);
      if (quantityProduced <= 0)
        throw new BadRequestException(
          `The quantityProduced must be greater than 0.`,
        );

      // Crear producción principal
      const production = this.productionRepo.create({
        product,
        quantityProduced,
      });

      // Obtener todos los productos de los productionItems de una sola vez
      const productIds = productionItems.map((item) => item.productId);
      const products = await this.productRepo.findByIds(productIds);

      // Calcular el costo total de los productionItems
      const totalCostArray = productionItems.map((item) => {
        const productItem = products.find((p) => p.id === item.productId);
        if (!productItem)
          throw new NotFoundException(
            `Product item with ID ${item.productId} not found.`,
          );
        return this.calculateItemCost(item, productItem);
      });

      const totalCost = totalCostArray.reduce(
        (acum, element) => acum + element,
        0,
      );
      production.totalCost = totalCost;

      // Guardar la producción principal
      await queryRunner.manager.save(production);

      if (productionItems.length > 0) {
        const items = [];

        for (const item of productionItems) {
          const productItem = products.find((p) => p.id === item.productId);

          if (!productItem)
            throw new NotFoundException(
              `Product item with ID ${item.productId} not found.`,
            );
          if (item.quantity <= 0)
            throw new BadRequestException(
              `The quantity must be greater than 0.`,
            );

          // Crear y añadir ProductionItem
          const productionItem = this.productionItemRepo.create({
            product: productItem,
            quantityUsed: item.quantity,
            production,
            cost: productItem.cost,
          });
          items.push(productionItem);

          // Actualizar el stock del producto
          productItem.stock = productItem.stock - item.quantity;
          const restInventorie = this.inventoriesRepo.create({
            product: productItem,
            quantity: -item.quantity,
            cost: productItem.cost,
          });

          // Guardar el inventario actualizado
          await queryRunner.manager.save(restInventorie);
          await queryRunner.manager.save(productItem);
        }

        // Guardar todos los ProductionItems
        await queryRunner.manager.save(items);
      }

      // Crear y guardar el nuevo inventario para el producto principal
      const newProductInventory = this.inventoriesRepo.create({
        product,
        quantity: production.quantityProduced,
        cost: totalCost / production.quantityProduced,
      });

      const newStock = product.stock + production.quantityProduced;

      // Calcular el nuevo costo promedio
      product.cost =
        (product.stock / newStock) * product.cost +
        (newProductInventory.quantity / newStock) * newProductInventory.cost;

      // Actualizar el stock del producto principal
      product.stock = newStock;

      await queryRunner.manager.save(newProductInventory);
      await queryRunner.manager.save(product);

      // Confirmar la transacción si todo salió bien
      await queryRunner.commitTransaction();
    } catch (error) {
      // Revertir la transacción en caso de error
      await queryRunner.rollbackTransaction();

      if (error instanceof QueryFailedError) {
        throw new BadRequestException('Database error: ' + error.message);
      } else {
        throw new InternalServerErrorException(
          `Error creating production: ${error.message}`,
        );
      }
    } finally {
      // Asegurarse de liberar el queryRunner
      await queryRunner.release();
    }
  }
}

// import {
//   Injectable,
//   NotFoundException,
//   InternalServerErrorException,
//   BadRequestException,
// } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { UUID } from 'crypto';
// import { Production } from 'src/entities/production.entity';
// import { ProductionItem } from 'src/entities/productionItem.entity';
// import { Repository } from 'typeorm';
// import { CreateProductionDto } from './production.dto';
// import { Product } from 'src/entities/product.entity';
// import { ProductInventories } from 'src/entities/productInventory';

// @Injectable()
// export class ProductionService {
//   constructor(
//     @InjectRepository(Production)
//     private productionRepo: Repository<Production>,
//     @InjectRepository(ProductionItem)
//     private productionItemRepo: Repository<ProductionItem>,
//     @InjectRepository(Product) private productRepo: Repository<Product>,
//     @InjectRepository(ProductInventories)
//     private inventoriesRepo: Repository<ProductInventories>,
//   ) {}

//   async findAll() {
//     return await this.productionRepo.find();
//   }
//   async findOne(id: UUID) {
//     const prodiction = await this.productionRepo.findOne({
//       where: { id },
//       relations: ['productionItems'],
//     });

//     return prodiction;
//   }
//   async create(data: CreateProductionDto) {
//     const queryRunner =
//       this.productionRepo.manager.connection.createQueryRunner();

//     await queryRunner.connect();
//     await queryRunner.startTransaction();

//     try {
//       const { productId, productionItems = [], quantityProduced } = data;

//       const product = await this.productRepo.findOne({
//         where: { id: productId },
//       });
//       if (!product) {
//         throw new NotFoundException(`Product with ID ${productId} not found.`);
//       }
//       if (quantityProduced <= 0) {
//         throw new BadRequestException(
//           `The quantityProduced must be greater than 0.`,
//         );
//       }

//       const productionToAdd = this.productionRepo.create({
//         product,
//         quantityProduced,
//       });

//       const totalCostArray = await Promise.all(
//         productionItems.map(async (item) => {
//           const productItem = await this.productRepo.findOne({
//             where: { id: item.productId },
//           });
//           const totalCostItem = item.quantity * productItem.cost;
//           return totalCostItem;
//         }),
//       );

//       const totalCost = totalCostArray.reduce(
//         (acum, element) => acum + element,
//         0,
//       );
//       productionToAdd.totalCost = totalCost;

//       await queryRunner.manager.save(productionToAdd);

//       if (productionItems.length > 0) {
//         const items = [];
//         for (const item of productionItems) {
//           const productItem = await this.productRepo.findOne({
//             where: { id: item.productId },
//           });

//           if (!productItem) {
//             throw new NotFoundException(
//               `Product item with ID ${item.productId} not found.`,
//             );
//           }
//           if (!(item.quantity > 0)) {
//             throw new BadRequestException(
//               `The quantity must be greater than 0.`,
//             );
//           }

//           const productionItem = this.productionItemRepo.create({
//             product: productItem,
//             quantityUsed: item.quantity,
//             production: productionToAdd,
//             cost: productItem.cost,
//           });

//           items.push(productionItem);

//           // Actualizar el stock del producto
//           productItem.stock = productItem.stock - item.quantity;
//           const restInventorie = this.inventoriesRepo.create({
//             product: productItem,
//             quantity: -item.quantity,
//             cost: productItem.cost,
//           });

//           // Guardar inventarios actualizados
//           await queryRunner.manager.save(restInventorie);
//           await queryRunner.manager.save(productItem);
//         }

//         // Guardar todos los ProductionItems
//         await queryRunner.manager.save(items);
//       }

//       // Crear y guardar el nuevo inventario para el producto principal
//       const newProductInventory = this.inventoriesRepo.create({
//         product,
//         quantity: productionToAdd.quantityProduced,
//         cost: totalCost / productionToAdd.quantityProduced,
//       });
//       const newStock = product.stock + productionToAdd.quantityProduced;

//       product.cost =
//         (product.stock / newStock) * product.cost +
//         (newProductInventory.quantity / newStock) * newProductInventory.cost;
//       product.stock = newStock;

//       await queryRunner.manager.save(newProductInventory);
//       await queryRunner.manager.save(product);

//       // Confirmar la transacción si todo salió bien
//       await queryRunner.commitTransaction();
//     } catch (error) {
//       // Revertir la transacción en caso de error
//       await queryRunner.rollbackTransaction();
//       throw new InternalServerErrorException(
//         'Error creating production: ' + error.message,
//       );
//     } finally {
//       // Asegurarse de liberar el queryRunner
//       await queryRunner.release();
//     }
//   }
// }

// productItem.stock = productItem.stock - item.quantity;
// const restInventorie = this.inventoriesRepo.create({
//   product: productItem,
//   quantity: -item.quantity,
// });
// await queryRunner.manager.save(restInventorie);
// await queryRunner.manager.save(productItem);

// async create(data: CreateProductionDto) {
//     const queryRunner =
//       this.productionRepo.manager.connection.createQueryRunner();
//     await queryRunner.connect();
//     await queryRunner.startTransaction();

//     try {
//       const { productId, productionItems, quantityProduced } = data;

//       const product = await this.productRepo.findOne({
//         where: { id: productId },
//       });
//       if (!product) {
//         throw new NotFoundException(
//           `productID  ${productId} not found (el producto que se quiere crear no se necontro)`,
//         );
//       }
//       if (quantityProduced <= 0) {
//         throw new BadRequestException(
//           `the quantityProduced must be grater than 0`,
//         );
//       }
//       const productiontoadd = this.productionRepo.create({
//         product,
//         quantityProduced,
//       });

//       await queryRunner.manager.save(productiontoadd);

//       if (productionItems.length > 0) {
//         const items = await Promise.all(
//           productionItems.map(async (item) => {
//             const productItem = await this.productRepo.findOne({
//               where: { id: item.productId },
//             });

//             if (!productItem) {
//               throw new NotFoundException(
//                 `the productId (itemproduction) ${item.productId} not found`,
//               );
//             }
//             if (!(item.quantity > 0)) {
//               throw new BadRequestException(
//                 `the quantity must be grater than 0`,
//               );
//             }
//             return this.productionItemRepo.create({
//               product: productItem,
//               quantityUsed: item.quantity,
//               production: productiontoadd,
//             });
//           }),
//         );
//         await queryRunner.manager.save(items);
//       }

//       const newProductInventory = this.inventoriesRepo.create({
//         product,
//         quantity: productiontoadd.quantityProduced,
//       });
//       product.stock = product.stock + productiontoadd.quantityProduced;

//       await queryRunner.manager.save(newProductInventory);
//       await queryRunner.manager.save(product);
//     } catch (error) {
//       await queryRunner.rollbackTransaction();
//       throw new InternalServerErrorException(
//         'Error creating formulation: ' + error.message,
//       );
//     } finally {
//       await queryRunner.release();
//     }
//   }
