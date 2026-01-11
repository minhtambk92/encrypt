// src/database/database.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', '123456'),
        database: configService.get<string>('DB_NAME', 'crypto_db'),
        
        // Tự động tìm các file .entity.ts để tạo table
        autoLoadEntities: true,
        
        // Lưu ý: synchronize: true chỉ dùng khi Dev để tự sinh table.
        // Khi lên Production mình sẽ dùng Migration anh nhé.
        synchronize: true, 
        
        // Cấu hình logging để anh dễ so sánh query với Java
        logging: configService.get<string>('NODE_ENV') === 'development',
      }),
    }),
  ],
})
export class DatabaseModule {}