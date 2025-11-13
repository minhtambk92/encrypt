import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import ElasticsearchModule  from './elasticsearch/elasticsearch.module';
import { CryptoService } from './crypto/crypto.service';
import { CryptoModule } from './crypto/crypto.module';
import { UserModule } from './user/user.module';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Rất quan trọng
    }),
    ElasticsearchModule,
    CryptoModule,
    UserModule,
    SeedModule
  ],
  controllers: [AppController],
  providers: [AppService, CryptoService],
})
export class AppModule {}
