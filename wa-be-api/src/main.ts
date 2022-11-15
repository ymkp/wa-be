import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { urlencoded, json } from 'express';
import { AppModule } from './app.module';
import { RedisIoAdapter } from './shared/adapters/redis-io.adapter';
import { VALIDATION_PIPE_OPTIONS } from './shared/constants';
import { RequestIdMiddleware } from './shared/middlewares/request-id/request-id.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe(VALIDATION_PIPE_OPTIONS));
  app.use(RequestIdMiddleware);
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));
  // Uncomment these lines to use the Redis adapter:
  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis();
  app.useWebSocketAdapter(redisIoAdapter);

  const configService = app.get(ConfigService);
  const appPrefix = configService.get('prefix');
  console.log('app prefix : ', appPrefix);
  app.setGlobalPrefix(appPrefix);
  const corsOptions = {
    allowedHeaders: '*',
    origin: '*',
    // origin: ['http://localhost:4200', 'http://10.200.201.102:8093'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
  };
  app.enableCors(corsOptions);

  /** Swagger configuration*/
  const options = new DocumentBuilder()
    .setTitle('WA BE API')
    .setDescription('API untuk API WA & SMS Mimin Situspol')
    .setVersion('0.1')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document);

  const port = configService.get<number>('port');
  await app.listen(port);
}
bootstrap();
