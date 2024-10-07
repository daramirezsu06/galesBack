import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FormulationItem } from 'src/entities/formulationItems';
import { Formulation } from 'src/entities/formulations.entity';
import { Repository } from 'typeorm';
import { CreateFormulationDto, UpdateFormulationDto } from './formulation.dto';
import { Product } from 'src/entities/product.entity';

@Injectable()
export class FormulationsService {
  constructor(
    @InjectRepository(Formulation)
    private formulationRepo: Repository<Formulation>,
    @InjectRepository(FormulationItem)
    private formulationItemRepo: Repository<FormulationItem>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
  ) {}

  async findAll() {
    return await this.formulationRepo.find({
      relations: ['product', 'formulationItems', 'formulationItems.product'],
    });
  }

  async findById(id: string) {
    const formulation = await this.formulationRepo.findOne({
      where: { id },
      relations: ['formulationItems'],
    });

    return formulation;
  }
  async create(data: CreateFormulationDto) {
    const queryRunner =
      this.formulationRepo.manager.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Buscar el producto asociado
      const product = await this.productRepo.findOne({
        where: { id: data.productId },
      });

      if (!product) {
        throw new NotFoundException(
          `Product with ID ${data.productId} not found`,
        );
      }

      // Crear la nueva formulación
      const newFormulation = this.formulationRepo.create({
        product,
        name: data.name,
        description: data.description,
        presentation: data.presentation,
      });

      // Guardar la formulación primero para obtener su ID
      await queryRunner.manager.save(newFormulation);

      // Si hay items en la formulación
      if (data.formulationItems.length > 0) {
        const items = await Promise.all(
          data.formulationItems.map(async (itemDto) => {
            const itemProduct = await this.productRepo.findOne({
              where: { id: itemDto.productId },
            });
            if (!itemProduct) {
              throw new NotFoundException(
                `Product with ID ${itemDto.productId} not found`,
              );
            }

            // Crear cada item y asociarlo a la formulación
            const item = this.formulationItemRepo.create({
              product: itemProduct,
              quantity: itemDto.quantity,
              formulation: newFormulation, // Aquí se asocia correctamente
            });

            return item;
          }),
        );

        // Guardar todos los items de la formulación
        await queryRunner.manager.save(items);
      }

      // Confirmar la transacción
      await queryRunner.commitTransaction();

      return newFormulation;
    } catch (error) {
      // Revertir la transacción en caso de error
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        'Error creating formulation: ' + error.message,
      );
    } finally {
      // Liberar el queryRunner
      await queryRunner.release();
    }
  }

  async update(id: string, changes: UpdateFormulationDto) {
    const formulation = await this.formulationRepo.findOne({
      where: { id },
      relations: ['formulationItems'],
    });

    if (!formulation) {
      throw new NotFoundException(`Formulation with ID ${id} not found`);
    }

    // Merge the changes into the existing formulation
    this.formulationRepo.merge(formulation, changes);

    // If there are changes to formulationItems, handle them accordingly
    if (changes.formulationItems) {
      const updatedItems = await Promise.all(
        changes.formulationItems.map(async (itemDto) => {
          const existingItem = formulation.formulationItems.find(
            (item) => item.id === itemDto.id,
          );

          if (existingItem) {
            // Update the existing item
            return this.formulationItemRepo.save({
              ...existingItem,
              ...itemDto,
            });
          } else {
            // Create a new item if it doesn't exist
            const newItem = this.formulationItemRepo.create({
              ...itemDto,
              formulation, // Establish the relationship
            });
            return this.formulationItemRepo.save(newItem);
          }
        }),
      );

      // Update the formulation with the updated items
      formulation.formulationItems = updatedItems;
    }

    return await this.formulationRepo.save(formulation);
  }
}

// async create(data: CreateFormulationDto) {
//     const product = await this.productRepo.findOne({
//       where: { id: data.productId },
//     });
//     if (!product) {
//       throw new NotFoundException(
//         `Product with ID ${data.productId} not found`,
//       );
//     }

//     const newFormulation = this.formulationRepo.create({
//       product,
//       name: data.name,
//       description: data.description,
//     });

//     if (data.formulationItems.length > 0) {
//       const items = await Promise.all(
//         data.formulationItems.map(async (itemDto) => {
//           const product = await this.productRepo.findOne({
//             where: { id: itemDto.productId },
//           });
//           if (!product) {
//             throw new NotFoundException(
//               `Product with ID ${itemDto.productId} not found`,
//             );
//           }

//           return this.formulationItemRepo.create({
//             product,
//             quantity: itemDto.quantity,
//             formulation: newFormulation,
//           });
//         }),
//       );

//       newFormulation.formulationItems = items;
//     }

//     return await this.formulationRepo.save(newFormulation);
//   }

// async create(data: CreateFormulationDto) {
//   const newFormulation = new Formulation();
//   if (data.productId) {
//     const product = await this.productRepo.findOne({
//       where: { id: data.productId },
//     });
//     newFormulation.product = product;
//     newFormulation.name = data.name;
//     newFormulation.description = data.description;
//     if (data.formulationItems.length > 0) {
//       const items = data.formulationItems;
//       const formuItems = [];
//       for (let index = 0; index < items.length; index++) {
//         const newitem = new FormulationItem();
//         newitem.product = await this.productRepo.findOne({
//           where: { id: items[index].productId },
//         });
//         newitem.quantity = items[index].quantity;
//         this.formulationItemRepo.create(newitem);
//         await this.formulationItemRepo.save(newitem);
//         formuItems.push(newitem);
//       }
//       newFormulation.formulationItems = formuItems;
//     }
//     this.formulationRepo.create(newFormulation);
//     return await this.formulationRepo.save(newFormulation);
//   }
// }
