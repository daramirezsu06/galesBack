import { ApiHideProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from './category.entity';
import { ProductImages } from './productImages.entity';
import { ProductInventories } from './productInventory.entity';
import { Brand } from './brand.entity';
import { ProductStatus } from '../models/productStatus.enum';
import { ProductAttribute } from './productAttributes.entity';
import { OrderDetail } from './orderDetail.entity';
import { ProductType } from '../models/productType.enum';
import { FormulationItem } from './formulationItems.entity';
import { Production } from './production.entity';
import { Formulation } from './formulations.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  slug: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  cod: string;

  @Column({ type: 'varchar', length: 40, nullable: true })
  sku?: string;

  @Column({
    type: 'decimal',
    name: 'cost',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  cost: number;

  @Column({
    type: 'decimal',
    name: 'original_price',
    precision: 10,
    scale: 2,
  })
  originalPrice: number;

  @Column({
    type: 'decimal',
    name: 'wholesale_price',
    precision: 10,
    scale: 2,
  })
  wholesalePrice: number;

  @Column({
    type: 'decimal',
    name: 'retail_price',
    precision: 10,
    scale: 2,
  })
  retailPrice: number;

  @Column({ type: 'int' })
  stock: number;

  @Column({ type: 'int', name: 'min_quantity' })
  minQuantity: number;

  @Column({ type: 'int', name: 'max_quantity', nullable: true })
  maxQuantity: number;

  @Column({ type: 'enum', enum: ProductStatus, default: ProductStatus.ACTIVE })
  status: ProductStatus;

  @Column({
    type: 'varchar',
    length: 255,
    // default: process.env.CLOUDINARY_DEFAULT_IMAGE,
    default:
      'https://res.cloudinary.com/dn7npxeof/image/upload/v1718440744/Henry/delicias-gales/photo-off_vrckds.svg',
  })
  thumbnail: string;

  @Column({ type: 'text', nullable: true })
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

  @Expose({ groups: ['findOne'] })
  @ManyToOne(() => Brand, (brand) => brand.products)
  @JoinColumn({ name: 'brand_id' })
  brand: Brand;

  @Expose({ groups: ['findAll'] })
  get brandId() {
    if (this.brand) {
      return this.brand.id;
    }
    return null;
  }

  @Exclude()
  @ManyToMany(() => Category, (category) => category.products)
  categories: Category[];

  @Expose()
  get categoriesIds() {
    if (this.categories) {
      return this.categories
        .filter((category) => !!category)
        .map((category) => category.id);
    }
    return [];
  }

  @OneToMany(() => ProductImages, (image) => image.product)
  images: ProductImages[];

  // @Expose()
  // get prodImages() {
  //   if (this.images) {
  //     return this.images.filter((image) => !!image);
  //   }
  // }

  @OneToMany(() => ProductInventories, (inventory) => inventory.product)
  inventories: ProductInventories[];

  @Exclude()
  @OneToMany(() => ProductAttribute, (prodAttr) => prodAttr.product)
  attributes: ProductAttribute[];

  @Expose()
  get prodAttributes() {
    if (this.attributes) {
      return this.attributes
        .filter((attribute) => !!attribute)
        .map((attribute) => ({
          id: attribute.id,
          attrId: attribute.attribute.id,
          value: attribute.value,
          name: attribute.attribute.name,
          unit: attribute.unit,
          unitDefault: attribute.attribute.unitDefault,
        }));
    }
    return [];
  }
  @Column({ type: 'enum', enum: ProductType, default: ProductType.MP })
  productType: ProductType;

  @OneToMany(() => OrderDetail, (orderDetail) => orderDetail.product)
  orderDetails: OrderDetail[];

  @OneToMany(() => Formulation, (formulation) => formulation.product)
  formulation: Formulation[];

  @OneToMany(() => Production, (production) => production.product)
  productions: Production;

  @OneToMany(
    () => FormulationItem,
    (formulationItem) => formulationItem.product,
  )
  formulationItem: FormulationItem[];
}
