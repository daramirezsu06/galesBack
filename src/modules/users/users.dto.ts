import { PartialType } from '@nestjs/mapped-types';
import { ApiHideProperty, OmitType } from '@nestjs/swagger';

import {
  IsBoolean,
  IsEmail,
  IsEmpty,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
  Validate,
} from 'class-validator';
import { MatchPass } from 'src/decorators/MatchPass.decorator';
import { CustomerType } from 'src/models/customerType.enum';
import { Role } from 'src/models/roles.enum';
import { UserStatus } from 'src/models/userStatus.enum';

export class CreateUserDto {
  /**
   * Nombre del usuario
   * @example Juan Perez
   */
  @IsString({ message: 'Name debe ser un string' })
  @IsNotEmpty({ message: 'Name no debe estar vacío' })
  name: string;

  /**
   *Correo electrónico del usuario
   * @example juan@example.com
   */
  @IsEmail({}, { message: 'Email debe ser un correo electrónico válido' })
  @IsNotEmpty({ message: 'Email no debe estar vacío' })
  email: string;

  /**
   * No utlices información personal ni compartas tu contraseña
   * @example Aa$12345678
   */
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(15)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/)
  readonly password: string;

  /**
   * No utlices información personal ni compartas tu contraseña
   * @example Aa$12345678
   */
  @IsString()
  @IsNotEmpty()
  @Validate(MatchPass, ['password'])
  readonly confPassword: string;

  /**
   * Número de teléfono del usuario
   * @example +5401158046525
   */
  @IsString({ message: 'Phone debe ser un string' })
  @IsOptional()
  phone: string;

  /**
   * Número de documento del usuario
   * @example 1234567890
   */
  @IsString({ message: 'Identificación Debe ser un string' })
  @IsOptional()
  identification: string;

  /**
   * Rol del usuario
   * @example Customer
   */
  @IsEnum(Role, { message: 'Role debe ser un valor válido de Role' })
  @IsOptional()
  role?: Role;

  @IsEmpty()
  @ApiHideProperty()
  recoveryToken?: string;

  /**
   * Estado del usuario
   * @example Active
   */
  @IsOptional()
  @IsEnum(UserStatus, {
    message: 'Status Debe ser un valor válido de UserStatus',
  })
  status: UserStatus;

  /**
   * Tipo de cliente
   * @example Retail
   */
  @IsOptional()
  @IsEnum(CustomerType, {
    message: 'CustomerType debe ser un valor válido de CustomerType',
  })
  customerType?: CustomerType;

  @IsEmpty()
  @ApiHideProperty()
  registerDate?: Date;

  /**
   * Dirección del cliente
   * @example Av Segurola 1500
   */
  @IsString({ message: 'Address debe ser un string' })
  @IsOptional()
  address?: string;

  /**
   * Website del cliente
   * @example https://website.com
   */
  @IsUrl({}, { message: 'El website debe ser una URL válida' })
  @IsOptional()
  website?: string;

  /**
   * La imagen debe ser una url y es opcional
   * @example https://res.cloudinary.com/dn7npxeof/image/upload/v1712238917/Henry/PM4-ecommerce/Sin_imagen_disponible_zxruow.webp
   */
  @IsUrl({}, { message: 'La imagen debe ser una URL válida' })
  @IsOptional()
  image?: string;

  @IsEmpty()
  sellerId?: string;

  @IsOptional()
  lat?: string;

  @IsOptional()
  lng?: string;
}
export class CreateUserwhitGoogleDto extends OmitType(CreateUserDto, [
  'confPassword',
  'identification',
  'phone',
  'status',
]) {}

export class CreateAdminUserDto extends OmitType(CreateUserDto, [
  'password',
  'confPassword',
]) {}
export class UpdateUserDto extends OmitType(PartialType(CreateUserDto), [
  'sellerId',
]) {
  @IsBoolean()
  @IsOptional()
  billing?: boolean;

  @IsOptional()
  @IsUUID()
  sellerId?: string;

  @IsString()
  @IsOptional()
  ruta?: string;
}
