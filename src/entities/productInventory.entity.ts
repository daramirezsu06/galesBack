import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';

import { ApiHideProperty } from '@nestjs/swagger';
import { Product } from './product.entity';
import { REASON } from '../models/reason.enum';

@Entity('product_inventories')
export class ProductInventories {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  date: Date;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'enum', enum: REASON, default: REASON.PURCHASE })
  reason: REASON;

  @Column({ type: 'varchar', nullable: true })
  observation: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  cost: number;

  @Exclude()
  @ApiHideProperty()
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Exclude()
  @ApiHideProperty()
  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'now()',
  })
  updatedAt: Date;

  @ManyToOne(() => Product, (product) => product.inventories)
  product: Product;
}
