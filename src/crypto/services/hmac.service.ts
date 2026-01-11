// src/crypto/services/hmac.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as crypto from 'crypto';
import { KeyHolderService } from './key-holder.service';

@Injectable()
export class HmacService {
  private readonly ALGORITHM = 'sha256';

  constructor(private readonly keyHolderService: KeyHolderService) {}

  /**
   * Tạo HMAC tương thích với javax.crypto.Mac bên Java
   * Output: Hex string
   */
  hash(plainText: string): string {
    if (!plainText) return plainText;

    try {
      const dek = this.keyHolderService.getDek();
      
      // Đồng bộ hóa với Java: Thường Java sẽ trim và lowercase trước khi hash để search
      const normalizedData = plainText.trim().toLowerCase();

      return crypto
        .createHmac(this.ALGORITHM, dek)
        .update(normalizedData, 'utf8')
        .digest('hex');
    } catch (error) {
      throw new InternalServerErrorException('HMAC generation failed: ' + error.message);
    }
  }
}