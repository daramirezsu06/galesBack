import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { REASON } from 'src/models/reason.enum';

export class AddInventory {
  @IsString()
  @IsNotEmpty()
  readonly productId: string;

  @IsOptional()
  readonly date: Date;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  readonly quantity: number;

  @IsString()
  @IsNotEmpty()
  readonly reason: REASON;

  @IsString()
  @IsOptional()
  readonly observation: string;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  readonly cost: number;
}
