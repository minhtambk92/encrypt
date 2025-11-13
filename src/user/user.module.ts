import { Module } from '@nestjs/common';
import {ConfigModule, ConfigService} from "@nestjs/config";
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { CryptoModule } from '../crypto/crypto.module';
import ElasticsearchModule  from '../elasticsearch/elasticsearch.module';

@Module({
  imports: [
    ConfigModule,
    CryptoModule, // Anh đã có cái này
    ElasticsearchModule,
  ],
  providers: [UserService],
  controllers: [UserController]
})
export class UserModule {}
