import { MigrationInterface, QueryRunner } from "typeorm";

export class Initialmigrat1728429452758 implements MigrationInterface {
    name = 'Initialmigrat1728429452758'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "description" character varying(255) NOT NULL, "show" boolean NOT NULL DEFAULT true, "image" character varying(255) NOT NULL DEFAULT 'https://res.cloudinary.com/dn7npxeof/image/upload/v1718440744/Henry/delicias-gales/photo-off_vrckds.svg', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_8b0be371d28245da6e4f4b61878" UNIQUE ("name"), CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "product_images" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "secure_url" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "productId" uuid, CONSTRAINT "PK_1974264ea7265989af8392f63a1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."product_inventories_reason_enum" AS ENUM('initial', 'purchase', 'supplier_return', 'adjustment', 'production', 'promotion', 'Donation', 'expired')`);
        await queryRunner.query(`CREATE TABLE "product_inventories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "date" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "quantity" integer NOT NULL, "reason" "public"."product_inventories_reason_enum" NOT NULL DEFAULT 'purchase', "observation" character varying, "cost" numeric(10,2) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "productId" uuid, CONSTRAINT "PK_7ff88ac3f0221978eea3f9f999a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "brands" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "description" character varying(255), "image" character varying(255) NOT NULL DEFAULT 'https://res.cloudinary.com/dn7npxeof/image/upload/v1718440744/Henry/delicias-gales/photo-off_vrckds.svg', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_96db6bbbaa6f23cad26871339b6" UNIQUE ("name"), CONSTRAINT "PK_b0c437120b624da1034a81fc561" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "attributes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(50) NOT NULL, "unit_default" character varying(20), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_89afb34fd1fdb2ceb1cea6c57df" UNIQUE ("name"), CONSTRAINT "PK_32216e2e61830211d3a5d7fa72c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "product_attributes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "value" character varying(50) NOT NULL, "unit" character varying(50), "createAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "productId" uuid, "attributeId" uuid, CONSTRAINT "PK_4fa18fc5c893cb9894fc40ca921" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "formulations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "presentation" integer NOT NULL DEFAULT '1', "name" character varying NOT NULL, "description" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "productId" uuid, CONSTRAINT "PK_b3b1b95f21213f45ee6596cb9ae" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "formulations_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "quantity" integer NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "productId" uuid, "formulationId" uuid, CONSTRAINT "PK_fabb4d12dbe7c18a0c0cc67e01d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "production_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "quantityUsed" integer NOT NULL, "cost" numeric(10,2), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "productionId" uuid, "productId" uuid, CONSTRAINT "PK_4028f0dc7163b956b17d9273f80" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."productions_status_enum" AS ENUM('IN_PROCESS', 'COMPLETED', 'CANCELLED')`);
        await queryRunner.query(`CREATE TABLE "productions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "quantityProduced" integer NOT NULL, "totalCost" numeric(10,2), "status" "public"."productions_status_enum" NOT NULL DEFAULT 'IN_PROCESS', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "productId" uuid, CONSTRAINT "PK_395fda0b6f26cb5fd9a2aa6315c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."products_status_enum" AS ENUM('active', 'paused')`);
        await queryRunner.query(`CREATE TYPE "public"."products_producttype_enum" AS ENUM('MP', 'EM', 'PT', 'CO', 'PI')`);
        await queryRunner.query(`CREATE TABLE "products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "slug" character varying(255) NOT NULL, "cod" character varying(20) NOT NULL, "sku" character varying(40), "cost" numeric(10,2), "original_price" numeric(10,2) NOT NULL, "wholesale_price" numeric(10,2) NOT NULL, "retail_price" numeric(10,2) NOT NULL, "stock" integer NOT NULL, "min_quantity" integer NOT NULL, "max_quantity" integer, "status" "public"."products_status_enum" NOT NULL DEFAULT 'active', "thumbnail" character varying(255) NOT NULL DEFAULT 'https://res.cloudinary.com/dn7npxeof/image/upload/v1718440744/Henry/delicias-gales/photo-off_vrckds.svg', "description" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "productType" "public"."products_producttype_enum" NOT NULL DEFAULT 'MP', "brand_id" uuid, CONSTRAINT "UQ_4c9fb58de893725258746385e16" UNIQUE ("name"), CONSTRAINT "UQ_868c40fd522fb29a28127dd7e29" UNIQUE ("cod"), CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "order_details" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "quantity" integer NOT NULL, "price" numeric(10,2) NOT NULL, "discount" integer, "subtotal" numeric(10,2) NOT NULL, "orderId" uuid, "productId" uuid, CONSTRAINT "PK_278a6e0f21c9db1653e6f406801" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "payments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "transaction_id" character varying NOT NULL, "payment_date" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "cuenta" integer NOT NULL, "amount" integer NOT NULL, "comision" integer NOT NULL, CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."orders_status_enum" AS ENUM('blocked', 'active', 'cancelled', 'delivered')`);
        await queryRunner.query(`CREATE TYPE "public"."orders_payment_method_enum" AS ENUM('debito', 'credito', 'efectivo', 'transferencia')`);
        await queryRunner.query(`CREATE TABLE "orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" "public"."orders_status_enum" NOT NULL DEFAULT 'active', "date" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "delivery_date" TIMESTAMP WITH TIME ZONE, "delivery_user" character varying, "total" integer NOT NULL, "payment_method" "public"."orders_payment_method_enum" NOT NULL DEFAULT 'efectivo', "payment_date" TIMESTAMP WITH TIME ZONE, "observation" character varying, "nro_factura" character varying, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "userId" uuid, "paymentsId" uuid, CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'seller', 'employee', 'customer')`);
        await queryRunner.query(`CREATE TYPE "public"."users_status_enum" AS ENUM('blocked', 'active', 'inactive')`);
        await queryRunner.query(`CREATE TYPE "public"."users_customer_type_enum" AS ENUM('retail', 'wholesaler')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(250) NOT NULL, "email" character varying(255) NOT NULL, "phone" character varying(15), "identification" character varying(20), "password" character varying(255) NOT NULL, "recovery_token" character varying(255), "role" "public"."users_role_enum" NOT NULL DEFAULT 'customer', "status" "public"."users_status_enum" NOT NULL DEFAULT 'active', "customer_type" "public"."users_customer_type_enum" DEFAULT 'retail', "register_date" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "address" character varying(255), "website" character varying(255), "image" character varying(255), "billing" boolean, "seller_id" uuid, "ruta" character varying(50), "lat" character varying(50), "lng" character varying(50), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."production_orders_status_enum" AS ENUM('IN_PROCESS', 'COMPLETED', 'CANCELLED')`);
        await queryRunner.query(`CREATE TABLE "production_orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "quantityProduced" integer NOT NULL, "totalCoststimated" numeric(10,2), "status" "public"."production_orders_status_enum" NOT NULL DEFAULT 'IN_PROCESS', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "productId" uuid, CONSTRAINT "PK_44d72e026027e3448b5d655e16e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "production_order_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "quantityUsed" integer NOT NULL, "cost" numeric(10,2), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "productionOrderId" uuid, "productId" uuid, CONSTRAINT "PK_da269696b3b9e90fcce0a1dac6d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "settings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "feature" character varying(50) NOT NULL, "name" character varying(50) NOT NULL, "value" character varying(255) NOT NULL, "order" integer NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_0669fe20e252eb692bf4d344975" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_b7bfa941c90a9d72aadf75d858" ON "settings" ("feature", "name") `);
        await queryRunner.query(`CREATE TABLE "products_categories" ("category_id" uuid NOT NULL, "product_id" uuid NOT NULL, CONSTRAINT "PK_634f5e1b5983772473fe0ec0008" PRIMARY KEY ("category_id", "product_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_19fe0fe8c2fcf1cbe1a80f639f" ON "products_categories" ("category_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_f2c76a4306a82c696d620f81f0" ON "products_categories" ("product_id") `);
        await queryRunner.query(`ALTER TABLE "product_images" ADD CONSTRAINT "FK_b367708bf720c8dd62fc6833161" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_inventories" ADD CONSTRAINT "FK_c444d1960e383239e953e5aee84" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_attributes" ADD CONSTRAINT "FK_5b71e4ee5c131f84708b9a0f358" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product_attributes" ADD CONSTRAINT "FK_5e0b0ccd26c6afc0a9821465a12" FOREIGN KEY ("attributeId") REFERENCES "attributes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "formulations" ADD CONSTRAINT "FK_f91ea326b612cf1338edbf46c30" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "formulations_items" ADD CONSTRAINT "FK_821b332ab868231a642124d4d07" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "formulations_items" ADD CONSTRAINT "FK_f204f7a010e86b41e1bff55e102" FOREIGN KEY ("formulationId") REFERENCES "formulations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "production_items" ADD CONSTRAINT "FK_ca1378245a3a72307d033d6f72e" FOREIGN KEY ("productionId") REFERENCES "productions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "production_items" ADD CONSTRAINT "FK_e5631115e0601e57a838a2f9c43" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "productions" ADD CONSTRAINT "FK_68a6b408962cd1fc91ac8ae278b" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_1530a6f15d3c79d1b70be98f2be" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_details" ADD CONSTRAINT "FK_147bc15de4304f89a93c7eee969" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_details" ADD CONSTRAINT "FK_c67ebaba3e5085b6401911acc70" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_151b79a83ba240b0cb31b2302d1" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_6151af79b89fee4657b94dd094d" FOREIGN KEY ("paymentsId") REFERENCES "payments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "production_orders" ADD CONSTRAINT "FK_8584be8f232016b2c24a4e12589" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "production_order_items" ADD CONSTRAINT "FK_5a4980b8b1596a2c3f72c7a94f4" FOREIGN KEY ("productionOrderId") REFERENCES "production_orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "production_order_items" ADD CONSTRAINT "FK_b4885c3bfc861a88306aefd1b49" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "products_categories" ADD CONSTRAINT "FK_19fe0fe8c2fcf1cbe1a80f639f1" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "products_categories" ADD CONSTRAINT "FK_f2c76a4306a82c696d620f81f08" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products_categories" DROP CONSTRAINT "FK_f2c76a4306a82c696d620f81f08"`);
        await queryRunner.query(`ALTER TABLE "products_categories" DROP CONSTRAINT "FK_19fe0fe8c2fcf1cbe1a80f639f1"`);
        await queryRunner.query(`ALTER TABLE "production_order_items" DROP CONSTRAINT "FK_b4885c3bfc861a88306aefd1b49"`);
        await queryRunner.query(`ALTER TABLE "production_order_items" DROP CONSTRAINT "FK_5a4980b8b1596a2c3f72c7a94f4"`);
        await queryRunner.query(`ALTER TABLE "production_orders" DROP CONSTRAINT "FK_8584be8f232016b2c24a4e12589"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_6151af79b89fee4657b94dd094d"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_151b79a83ba240b0cb31b2302d1"`);
        await queryRunner.query(`ALTER TABLE "order_details" DROP CONSTRAINT "FK_c67ebaba3e5085b6401911acc70"`);
        await queryRunner.query(`ALTER TABLE "order_details" DROP CONSTRAINT "FK_147bc15de4304f89a93c7eee969"`);
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_1530a6f15d3c79d1b70be98f2be"`);
        await queryRunner.query(`ALTER TABLE "productions" DROP CONSTRAINT "FK_68a6b408962cd1fc91ac8ae278b"`);
        await queryRunner.query(`ALTER TABLE "production_items" DROP CONSTRAINT "FK_e5631115e0601e57a838a2f9c43"`);
        await queryRunner.query(`ALTER TABLE "production_items" DROP CONSTRAINT "FK_ca1378245a3a72307d033d6f72e"`);
        await queryRunner.query(`ALTER TABLE "formulations_items" DROP CONSTRAINT "FK_f204f7a010e86b41e1bff55e102"`);
        await queryRunner.query(`ALTER TABLE "formulations_items" DROP CONSTRAINT "FK_821b332ab868231a642124d4d07"`);
        await queryRunner.query(`ALTER TABLE "formulations" DROP CONSTRAINT "FK_f91ea326b612cf1338edbf46c30"`);
        await queryRunner.query(`ALTER TABLE "product_attributes" DROP CONSTRAINT "FK_5e0b0ccd26c6afc0a9821465a12"`);
        await queryRunner.query(`ALTER TABLE "product_attributes" DROP CONSTRAINT "FK_5b71e4ee5c131f84708b9a0f358"`);
        await queryRunner.query(`ALTER TABLE "product_inventories" DROP CONSTRAINT "FK_c444d1960e383239e953e5aee84"`);
        await queryRunner.query(`ALTER TABLE "product_images" DROP CONSTRAINT "FK_b367708bf720c8dd62fc6833161"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f2c76a4306a82c696d620f81f0"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_19fe0fe8c2fcf1cbe1a80f639f"`);
        await queryRunner.query(`DROP TABLE "products_categories"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b7bfa941c90a9d72aadf75d858"`);
        await queryRunner.query(`DROP TABLE "settings"`);
        await queryRunner.query(`DROP TABLE "production_order_items"`);
        await queryRunner.query(`DROP TABLE "production_orders"`);
        await queryRunner.query(`DROP TYPE "public"."production_orders_status_enum"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_customer_type_enum"`);
        await queryRunner.query(`DROP TYPE "public"."users_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP TABLE "orders"`);
        await queryRunner.query(`DROP TYPE "public"."orders_payment_method_enum"`);
        await queryRunner.query(`DROP TYPE "public"."orders_status_enum"`);
        await queryRunner.query(`DROP TABLE "payments"`);
        await queryRunner.query(`DROP TABLE "order_details"`);
        await queryRunner.query(`DROP TABLE "products"`);
        await queryRunner.query(`DROP TYPE "public"."products_producttype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."products_status_enum"`);
        await queryRunner.query(`DROP TABLE "productions"`);
        await queryRunner.query(`DROP TYPE "public"."productions_status_enum"`);
        await queryRunner.query(`DROP TABLE "production_items"`);
        await queryRunner.query(`DROP TABLE "formulations_items"`);
        await queryRunner.query(`DROP TABLE "formulations"`);
        await queryRunner.query(`DROP TABLE "product_attributes"`);
        await queryRunner.query(`DROP TABLE "attributes"`);
        await queryRunner.query(`DROP TABLE "brands"`);
        await queryRunner.query(`DROP TABLE "product_inventories"`);
        await queryRunner.query(`DROP TYPE "public"."product_inventories_reason_enum"`);
        await queryRunner.query(`DROP TABLE "product_images"`);
        await queryRunner.query(`DROP TABLE "categories"`);
    }

}
