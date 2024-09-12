import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class FormulationItemBaseDto {
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

export class FormulationItemDto extends FormulationItemBaseDto {}

export class UpdateFormulationItemDto {
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

export class CreateFormulationDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  productId: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  presentation: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ type: [FormulationItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FormulationItemDto)
  formulationItems: FormulationItemDto[];
}

export class UpdateFormulationDto {
  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  productId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  presentation?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ type: [UpdateFormulationItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateFormulationItemDto)
  formulationItems?: UpdateFormulationItemDto[];
}
