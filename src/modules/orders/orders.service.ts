import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  LessThanOrEqual,
  MoreThan,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { Order } from 'src/entities/order.entity';
import { OrderDetail } from 'src/entities/orderDetail.entity';
import { User } from 'src/entities/user.entity';
import { Product } from 'src/entities/product.entity';
import { UpdateOrderProductDto } from './order.dto';
import { UUID } from 'crypto';
import { Preference } from 'mercadopago';
import { mercadopagoConfig } from 'src/config/mercadoPago';
import { PayDto } from './pay.dto';
import { PaymentStatus, PaymentTerms } from 'src/models/orderStatus.enum';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(OrderDetail)
    private readonly ordersDetailsRepository: Repository<OrderDetail>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}
  async findAll({
    userId,
    initialDate,
    finalDate,
  }: {
    userId: string;
    initialDate: Date;
    finalDate: Date;
  }) {
    const user = await this.usersRepository.findOneBy({ id: userId });
    console.log(user);

    if (user.role !== 'admin') {
      if (user.role === 'customer' || user.role === 'employee') {
        const orderUsers = await this.ordersRepository.find({
          where: {
            user: { id: userId },
            createdAt: Between(initialDate, finalDate),
          },
        });
        return orderUsers;
      }
      if (user.role === 'seller') {
        const orderSeller = await this.ordersRepository.find({
          where: [
            { user: { sellerId: userId } }, // Órdenes asociadas al vendedor
            { user: { id: userId } },
            { createdAt: Between(initialDate, finalDate) }, // Órdenes creadas por el vendedor
          ],
          relations: ['user'], // Aseguramos que se unan las relaciones necesarias
        });
        return orderSeller;
      }
    }
    const orders = await this.ordersRepository.find();
    return orders;
  }

  async createOrder(
    userId: string,
    products: { id: string; quantity: number }[],
    paymentTerms: PaymentTerms,
  ) {
    let total = 0;
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('User not found');

    const order = new Order();
    order.user = user;
    order.date = new Date();
    order.total = 0; // Inicializa el total como 0
    order.paymentTerms = paymentTerms;
    if (paymentTerms == PaymentTerms.CASH) {
      order.PaymentStatus = PaymentStatus.PAID;
      order.paymentDate = new Date();
    }

    const newOrder = await this.ordersRepository.save(order);

    const orderDetailsArray = await Promise.all(
      products.map(async (elem) => {
        const product = await this.productsRepository.findOneBy({
          id: elem.id,
          stock: MoreThan(0),
        });
        if (!product) throw new NotFoundException('Product not found');
        if (product.stock < elem.quantity)
          throw new NotFoundException(
            'Product not available in sufficient quantity',
          );

        //Calcula el precio de la orden de acuerdo al tipo de cliente que sea
        const priceTypeUser = Number(
          user.customerType === 'wholesaler'
            ? product.wholesalePrice
            : product.retailPrice,
        );

        total += priceTypeUser * elem.quantity;

        await this.productsRepository.update(
          { id: product.id },
          { stock: product.stock - elem.quantity },
        );

        const orderDetail = new OrderDetail();
        orderDetail.product = product;
        orderDetail.quantity = elem.quantity;
        orderDetail.price = Number(priceTypeUser.toFixed(2));
        orderDetail.subtotal = Number(
          (priceTypeUser * elem.quantity).toFixed(2),
        );
        orderDetail.discount = 0; // Asume que no hay descuento. Ajusta según sea necesario.
        orderDetail.order = newOrder;

        return orderDetail;
      }),
    );

    // Guarda todos los detalles de la orden en la base de datos
    await this.ordersDetailsRepository.save(orderDetailsArray);

    // Actualiza el total de la orden y guarda los cambios
    newOrder.total = total;
    await this.ordersRepository.save(newOrder);

    const finalOrder = await this.ordersRepository.findOne({
      where: { id: newOrder.id },
      relations: ['user', 'orderDetails', 'orderDetails.product'],
    });

    if (finalOrder && finalOrder.user) {
      delete finalOrder.user.password;
    }

    return finalOrder;
  }

  async findById(id: UUID) {
    return await this.ordersRepository.findOne({
      where: { id },
      relations: ['user', 'orderDetails'],
    });
  }

  async updateOrder(
    userId: UUID,
    orderId: UUID,
    changes: UpdateOrderProductDto,
  ) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    const order = await this.ordersRepository.findOneBy({ id: orderId });
    if (order) {
      order.status = changes.status;
      order.deliveryUser = userId;
      order.deliveryDate = changes.deliveryDate;
      order.paymentMethod = changes.paymentMethod;
      order.paymentDate = changes.paymentDate;
      order.observation = changes.observation;
      order.nroFactura = changes.nroFactura;
    } else {
      throw new NotFoundException('Order not found');
    }

    await this.ordersRepository.update({ id: orderId }, order);

    return { message: 'Order updated successfully', ...order };
  }
  async updatePayment(orderId) {
    const order = await this.ordersRepository.findOneBy({ id: orderId });
    if (order && order.PaymentStatus == PaymentStatus.PENDING) {
      order.PaymentStatus = PaymentStatus.PAID;
      order.paymentDate = new Date();
    }

    return this.ordersRepository.save(order);
  }

  async createOrderSeller(
    sellerId: string,
    userId: string,
    products: { id: string; quantity: number }[],
  ) {
    let total = 0;
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const order = new Order();
    order.user = user;
    order.deliveryUser = sellerId; // Asigna al vendedor como responsable de la entrega
    order.date = new Date();
    order.total = 0;

    const newOrder = await this.ordersRepository.save(order);

    const orderDetailsArray = await Promise.all(
      products.map(async (elem) => {
        const product = await this.productsRepository.findOneBy({
          id: elem.id,
          stock: MoreThan(0),
        });
        if (!product) throw new NotFoundException('Product not found');
        if (product.stock < elem.quantity)
          throw new NotFoundException(
            'Product not available in sufficient quantity',
          );

        //Calcula el precio de la orden de acuerdo al tipo de cliente que sea
        const priceTypeUser = Number(
          user.customerType === 'wholesaler'
            ? product.wholesalePrice
            : product.retailPrice,
        );

        total += priceTypeUser * elem.quantity;

        await this.productsRepository.update(
          { id: product.id },
          { stock: product.stock - elem.quantity },
        );

        const orderDetail = new OrderDetail();
        orderDetail.product = product;
        orderDetail.quantity = elem.quantity;
        orderDetail.price = Number(priceTypeUser.toFixed(2));
        orderDetail.subtotal = Number(
          (priceTypeUser * elem.quantity).toFixed(2),
        );
        orderDetail.discount = 0; // Asume que no hay descuento. Ajusta según sea necesario.
        orderDetail.order = newOrder;

        return orderDetail;
      }),
    );

    // Guarda todos los detalles de la orden en la base de datos
    await this.ordersDetailsRepository.save(orderDetailsArray);

    // Actualiza el total de la orden y guarda los cambios
    newOrder.total = total;
    await this.ordersRepository.save(newOrder);

    const finalOrder = await this.ordersRepository.findOne({
      where: { id: newOrder.id },
      relations: ['user', 'orderDetails', 'orderDetails.product'],
    });

    if (finalOrder && finalOrder.user) {
      delete finalOrder.user.password;
    }

    return finalOrder;
  }

  async createPay(pay: PayDto) {
    const orderValidate = await this.ordersRepository.findOne({
      where: { id: pay.orderId },
      relations: ['user', 'orderDetails', 'orderDetails.product'],
    });

    if (!orderValidate) {
      throw new NotFoundException('Order not found');
    }
    const preference = await new Preference(mercadopagoConfig.client).create({
      body: {
        items: [
          {
            id: pay.orderId,
            title: `Orden numero ${pay.orderId} de ${orderValidate.user.name}`,
            quantity: 1,
            currency_id: 'COP',
            unit_price: pay.amount,
          },
        ],
        back_urls: {
          success: 'http://localhost:3001/success',
          failure: 'http://localhost:3001/failure',
          pending: 'http://localhost:3001/pending',
        },
      },
    });
    console.log(preference);

    return {
      urlMercadoPago: preference.init_point!,
    };
  }
}
