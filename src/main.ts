import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { loggerGlobal } from './middleware/logger.middleware';
import * as session from 'express-session';
import * as passport from 'passport';

async function bootstrap() {
  console.log('NODE_ENV:', process.env.NODE_ENV);

  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.use(loggerGlobal);

  // Interceptor para serializar
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  app.useGlobalPipes(
    new ValidationPipe({
      // Elimina del payload los atributos que no esten definidos en el dto
      whitelist: true,
      // Rechaza la petición indicando que se envía un atributo que no es esperado
      forbidNonWhitelisted: true,
    }),
  );
  app.use(
    session({
      secret: process.env.SESSION_PASSPORT,
      saveUninitialized: false,
      resave: false,
      cookie: {
        maxAge: 60000,
      },
    }),
  );
  app.use(passport.initialize());
  app.use(passport.session());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Delicias Gales S. A. S')
    .setDescription('Docuemntación para la API Delicias Gales S. A. S.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
