import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from './product.entity';
import {
  ProductionOrderStatus,
  ProductionStatus,
} from '../models/productionEstatus.enum';
import { ProductionOrderItem } from './productionOrderItem.entity';

@Entity('production_orders')
export class ProductionOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Product, (product) => product.productions, { eager: true })
  product: Product;

  @Column({ type: 'int' })
  quantityProduced: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalCoststimated?: number;

  @Column({
    type: 'enum',
    enum: ProductionStatus,
    default: ProductionOrderStatus.IN_PROCESS,
  })
  status: ProductionOrderStatus;

  @OneToMany(
    () => ProductionOrderItem,
    (productionOrderItem) => productionOrderItem.productionOrder,
    {
      cascade: true,
    },
  )
  productionOrderItems: ProductionOrderItem[];

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'now()',
  })
  updatedAt: Date;
}
