import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { Exclude } from 'class-transformer';
import { ApiHideProperty } from '@nestjs/swagger';
import { FormulationItem } from './formulationItems.entity';

@Entity({ name: 'formulations' })
export class Formulation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 1 })
  presentation: number;

  @Column()
  name: string;

  @Column()
  description: string;

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

  @ManyToOne(() => Product, (product) => product.formulation)
  product: Product;

  @OneToMany(
    () => FormulationItem,
    (formulationItem) => formulationItem.formulation,
    { cascade: true },
  )
  formulationItems: FormulationItem[];
}
