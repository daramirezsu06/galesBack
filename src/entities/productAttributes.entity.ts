import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Attribute } from './attribute.entity';
import { Product } from './product.entity';

@Entity({ name: 'product_attributes' })
export class ProductAttribute {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  value: string;

  @CreateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createAt: Date;

  @CreateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  // Relación hacia products
  // Habililitamos la relación bidireccional
  // porque nos interesa obtener los atributos
  // que posee un producto.
  @ManyToOne(() => Product, (product) => product.attributes)
  product: Product;

  // Relación hacia attributes
  // No habililitamos la relación bidireccional
  // Nos nos interesa los obtener los productos ingresando por atributo
  @ManyToOne(() => Attribute)
  attribute: Attribute;
}
