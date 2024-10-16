import { Module, Global } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import config from '../config';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [config.KEY],
      useFactory: (configService: ConfigType<typeof config>) => {
        const { dbHost, dbPort, dbName, dbUser, dbPass } =
          configService.postgres;
        return {
          type: 'postgres',
          host: dbHost,
          port: dbPort,
          username: dbUser,
          password: dbPass,
          database: dbName,
          // Migraciones -> pasamos synchronize a false, comentamos entities
          // y dropschema
          synchronize: true,
          autoLoadEntities: true,
          ssl: {
            rejectUnauthorized: false, // Esto es importante si no estás usando un certificado verificado
          },
          logging: ['error'],
          // logging: true,
          // dropSchema: true,
        };
      },
    }),
  ],
})
export class DatabseModule {}
