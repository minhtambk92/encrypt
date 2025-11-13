// src/seed.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SeedService } from './seed/seed.service';

async function bootstrap() {
    // Tạo app context (không start server)
    const app = await NestFactory.createApplicationContext(AppModule);

    console.log('Lấy SeedService từ context...');
    const seedService = app.get(SeedService);

    try {
        // Gọi hàm seed
        await seedService.seedUsers(2_000_000); // 1 triệu users
    } catch (error) {
        console.error('Script seed thất bại:', error);
    } finally {
        // Đóng app
        await app.close();
        console.log('Đã đóng application context.');
    }
}

bootstrap();