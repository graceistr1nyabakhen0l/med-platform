import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  console.log('DATABASE_URL =', process.env.DATABASE_URL);
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');
  app.enableCors(); // Mengizinkan request dari frontend port 3001

  const config = new DocumentBuilder()
    .setTitle('Medical Platform API')
    .setDescription('API Dokumentasi')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('swagger', app, document);

  await app.listen(3000, '0.0.0.0');

  console.log('Backend run on port 3000');
  console.log('Swagger: http://localhost:3000/swagger');
}

bootstrap();