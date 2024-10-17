import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ProductionItemBaseDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  quantity: number;
}

// export class ProductionItemDto extends ProductionItemBaseDto {}

export class UpdateProductionItemDto {
  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  productId?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(1)
  @IsOptional()
  quantity?: number;
}

export class CreateProductionDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ type: [ProductionItemBaseDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductionItemBaseDto)
  productionItems: ProductionItemBaseDto[];

  @ApiPropertyOptional()
  @IsNumber()
  @Min(1)
  @IsOptional()
  quantityProduced: number;

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  productionOrdertId: string;
}

export class CreateProductionOrderDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ type: [ProductionItemBaseDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductionItemBaseDto)
  productionItems: ProductionItemBaseDto[];

  @ApiPropertyOptional()
  @IsNumber()
  @Min(1)
  @IsOptional()
  quantityProduced: number;
}

export class UpdateProductionDto {
  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  productId?: string;

  @ApiPropertyOptional({ type: [UpdateProductionItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateProductionItemDto)
  formulationItems?: UpdateProductionItemDto[];

  @ApiPropertyOptional()
  @IsNumber()
  @Min(1)
  @IsOptional()
  quantityProduced: number;
}
