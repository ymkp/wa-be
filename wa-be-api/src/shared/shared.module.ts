import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { configModuleOptions } from './configs/config-module-options';
import { EmailModule } from './email';

import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { AppLoggerModule } from './logger/logger.module';
import { EncryptService } from './signing/encrypt.service';

@Module({
  imports: [
    ConfigModule.forRoot(configModuleOptions),
    CacheModule.register({ ttl: 0 }),
    JwtModule.registerAsync({
      imports: [SharedModule],
      useFactory: async (configService: ConfigService) => ({
        publicKey: configService.get<string>('jwt.publicKey'),
        privateKey: configService.get<string>('jwt.privateKey'),
        signOptions: {
          algorithm: 'RS256',
        },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('database.host'),
        port: configService.get<number | undefined>('database.port'),
        database: configService.get<string>('database.name'),
        username: configService.get<string>('database.user'),
        password: configService.get<string>('database.pass'),
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        // Timezone configured on the MySQL server.
        // This is used to typecast server date/time values to JavaScript Date object and vice versa.
        // timezone: 'z',
        synchronize: true,
        debug: configService.get<string>('env') === 'development',
      }),
    }),
    AppLoggerModule,
    EmailModule,
  ],
  exports: [AppLoggerModule, ConfigModule, EmailModule, CacheModule, JwtModule],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    JwtService,
    EncryptService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class SharedModule {}
