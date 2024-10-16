import {
  IsArray,
  IsNotEmpty,
  ValidateNested,
  IsUUID,
  IsInt,
  Min,
  IsString,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus, PaymentTerms } from 'src/models/orderStatus.enum';
import { PaymentMethod } from 'src/models/paymentMethods.enum';

class CreateOrderProductDto {
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderProductDto)
  products: CreateOrderProductDto[];

  @IsOptional()
  @IsEnum(PaymentTerms)
  paymentTerms: PaymentTerms;
}

export class UpdateOrderProductDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @IsOptional()
  deliveryDate?: Date = new Date();

  @IsOptional()
  @IsUUID()
  deliveryUser: string;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @IsOptional()
  paymentDate?: Date = new Date();

  @IsString()
  @IsOptional()
  observation: string;

  @IsString()
  @IsOptional()
  nroFactura: string;
}
