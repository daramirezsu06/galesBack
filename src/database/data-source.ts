import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { join } from 'path'; // Importar join para construir rutas

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.TYPEORM_URL,
  synchronize: Boolean(process.env.TYPEORM_SYNCHRONIZE),
  logging: Boolean(process.env.TYPEORM_LOGGING),
  migrations: [join(__dirname, '../database/migrations/*.ts')],
  migrationsTableName: process.env.TYPEORM_MIGRATIONS_TABLE_NAME,
  entities: [join(__dirname, '../entities/*.entity.ts')],
});
