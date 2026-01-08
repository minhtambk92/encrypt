// src/crypto/services/hmac.service.ts
import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class HmacService {
  /**
   * Thực hiện hash dữ liệu bằng thuật toán HMAC-SHA256
   * @param data Dữ liệu cần hash (thường là plaintext)
   * @param key Chìa khóa DEK lấy từ CSP
   * @returns Chuỗi hash định dạng Hex
   */
  hash(data: string, key: string): string {
    if (!data) return data;

    // Lưu ý: Để đồng bộ search giữa Java và NestJS, 
    // anh nên thống nhất việc normalize dữ liệu (ví dụ: toLowerCase)
    const normalizedData = data.toLowerCase().trim();

    return crypto
      .createHmac('sha256', key)
      .update(normalizedData, 'utf8')
      .digest('hex'); // Trả về định dạng hex để lưu vào DB tương thích với Java
  }

  /**
   * So sánh dữ liệu plaintext với một mã hash có sẵn
   */
  verify(data: string, hash: string, key: string): boolean {
    const newHash = this.hash(data, key);
    return crypto.timingSafeEqual(
      Buffer.from(hash, 'hex'),
      Buffer.from(newHash, 'hex'),
    );
  }
}