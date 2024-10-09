import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../../entities/order.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrderDetail } from '../../entities/orderDetail.entity';
import { User } from '../../entities/user.entity';
import { Product } from '../../entities/product.entity';
import { Payments } from '../../entities/payments.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderDetail, User, Product, Payments]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
