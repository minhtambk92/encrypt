import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { CryptoModule } from './crypto/crypto.module';
import { DatabaseModule } from './database/database.module';
import { MockKmsController } from './mock/mock-kms.controller';
import { UserModule } from './user/user.module';
// import { CryptoService } from './crypto/crypto.service';
// import { SeedModule } from './seed/seed.module';
// import ElasticsearchModule  from './elasticsearch/elasticsearch.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Để các module khác không cần import lại ConfigModule
    }),
    DatabaseModule,
    // ElasticsearchModule,
    CryptoModule,
    UserModule,
    // SeedModule
  ],
  controllers: [
    MockKmsController,
    AppController
  ],
  providers: [
    AppService, 
    // CryptoService
  ],
})
export class AppModule {}
