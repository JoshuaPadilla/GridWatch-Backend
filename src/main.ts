import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/gridwatch/');

  app.enableCors({
    origin: '*', // Allow any domain
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: '*', // Allow any headers
  });

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
