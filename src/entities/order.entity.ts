import {
  OrderStatus,
  PaymentStatus,
  PaymentTerms,
} from '../models/orderStatus.enum';
import { PaymentMethod } from '../models/paymentMethods.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { v4 as uuid } from 'uuid';
import { OrderDetail } from './orderDetail.entity';
import { Exclude } from 'class-transformer';
import { ApiHideProperty } from '@nestjs/swagger';
import { Payments } from './payments.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string = uuid();

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.ACTIVE })
  status: OrderStatus;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    name: 'Payment_status',
    default: PaymentStatus.PENDING,
  })
  PaymentStatus: PaymentStatus;
  @Column({
    type: 'enum',
    enum: PaymentTerms,
    name: 'Payment_terms',
  })
  paymentTerms: PaymentTerms;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  date: Date;

  @Column({
    type: 'timestamptz',
    name: 'delivery_date',
    nullable: true,
  })
  deliveryDate: Date;

  @Column({ name: 'delivery_user', nullable: true })
  deliveryUser: string;

  @Column()
  total: number;

  @Column({
    type: 'enum',
    name: 'payment_method',
    enum: PaymentMethod,
    default: PaymentMethod.EFECTIVO,
  })
  paymentMethod: PaymentMethod;

  @Column({
    type: 'timestamptz',
    name: 'payment_date',
    nullable: true,
  })
  paymentDate: Date;

  @Column({ nullable: true })
  observation: string;

  @Column({ name: 'nro_factura', nullable: true })
  nroFactura: string;

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

  @ManyToOne(() => User, (user) => user.orders)
  user: User;

  @OneToMany(() => OrderDetail, (orderDetail) => orderDetail.order)
  orderDetails: OrderDetail[];

  @ManyToOne(() => Payments, (payments) => payments.order)
  payments: Payments;
}
