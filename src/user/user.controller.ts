// src/user/user.controller.ts
import { Controller, Get, Post, Body } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Controller('test-crypto')
export class TestCryptoController {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  @Post('save')
  async saveUser(@Body() data: { username: string; email: string }) {
    const user = new User();
    user.username = data.username;
    user.email = data.email;

    // Khi gọi save(), CryptoSubscriber sẽ tự động mã hóa email, 
    // tạo email_hash và email_bigram trước khi ghi vào Postgres.
    const savedUser = await this.userRepository.save(user);
    return {
      message: 'Đã lưu vào DB thành công!',
      dataSavedInEntity: savedUser, 
    };
  }

  @Get('get-all')
  async getAll() {
    // Khi gọi find(), CryptoSubscriber sẽ tự động giải mã email sau khi load từ DB.
    const users = await this.userRepository.find();
    return {
      message: 'Dữ liệu lấy từ DB (đã tự động giải mã):',
      users,
    };
  }
}