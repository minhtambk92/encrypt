// src/seed/seed.module.ts
import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { CryptoModule } from '../crypto/crypto.module'; // Import crypto
import ElasticsearchModule  from '../elasticsearch/elasticsearch.module';

@Module({
  imports: [
    ElasticsearchModule, // Cần để dùng esService
    CryptoModule,        // Cần để dùng cryptoService
  ],
  providers: [SeedService],
  exports: [SeedService], // Export ra để script bên ngoài gọi
})
export class SeedModule {}