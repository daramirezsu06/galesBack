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
import { ProductionItem } from './productionItem.entity';
import { ProductionStatus } from '../models/productionEstatus.enum';

@Entity('productions')
export class Production {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Product, (product) => product.productions, { eager: true })
  product: Product;

  @Column({ type: 'int' })
  quantityProduced: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalCost?: number;

  @Column({
    type: 'enum',
    enum: ProductionStatus,
    default: ProductionStatus.IN_PROCESS,
  })
  status: ProductionStatus;

  @OneToMany(
    () => ProductionItem,
    (productionItem) => productionItem.production,
    {
      cascade: true,
    },
  )
  productionItems: ProductionItem[];

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
