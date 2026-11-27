import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { WsAdapter } from '@nestjs/platform-ws';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module.js';

async function start() {
  const app = await NestFactory.create(AppModule);
  
  app.useWebSocketAdapter(new WsAdapter(app));

  const config = app.get(ConfigService);
  const port = config.getOrThrow<number>('app.port');

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const configSwagger = new DocumentBuilder()
  .setTitle('Comments API')
  .setDescription(
    'API для SPA приложения комментариев. Поддерживает создание комментариев и ответов, CAPTCHA, загрузку файлов и получение вложенных комментариев.',
  )
  .setVersion('1.0')
  .build();

  const document = SwaggerModule.createDocument(app, configSwagger);

  SwaggerModule.setup('docs', app, document, {
    useGlobalPrefix: true,
  });

  await app.listen(port, () => console.log(`Server started on port: ${port}`));
}

start().catch((error: unknown) => {
  console.log('Error while starting the server: ', error);
  process.exit(1);
});
