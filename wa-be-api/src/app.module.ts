import { CacheModule, Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { SharedModule } from './shared/shared.module';
import { UserModule } from './user/user.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { WhatsappModule } from './whatsapp/whatsapp.module';

@Module({
  imports: [
    SharedModule,
    AuthModule,
    UserModule,
    CacheModule.register(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    WhatsappModule,
  ],
})
export class AppModule {}
