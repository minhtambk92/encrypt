import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from "@nestjs/config";
// import { UserService } from './user.service';
import { TestCryptoController } from './user.controller';
import { User } from './entities/user.entity';

@Module({
  imports: [
    ConfigModule,
    // Đây là dòng quan trọng nhất: Đăng ký Entity User vào Module này
    TypeOrmModule.forFeature([User]),
  ],
  // providers: [UserService],
  controllers: [TestCryptoController],
  exports: [],
})
export class UserModule {}
