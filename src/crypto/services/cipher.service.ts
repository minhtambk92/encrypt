// src/crypto/services/cipher.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as crypto from 'crypto';
import { KeyHolderService } from './key-holder.service';

@Injectable()
export class CipherService {
  private readonly ALGORITHM = 'aes-256-gcm';
  private readonly IV_LENGTH = 12; // Chuẩn GCM
  private readonly TAG_LENGTH = 16; // Chuẩn GCM Auth Tag

  constructor(private readonly keyHolderService: KeyHolderService) {}

  /**
   * Mã hóa AES-GCM tương thích Java
   * Output: Base64(IV + Ciphertext + Tag)
   */
  encrypt(plainText: string): string {
    if (!plainText) return plainText;

    try {
      const dek = this.keyHolderService.getDek(); // Buffer từ KeyHolder
      const iv = crypto.randomBytes(this.IV_LENGTH);
      
      const cipher = crypto.createCipheriv(this.ALGORITHM, dek, iv);
      
      const encrypted = Buffer.concat([
        cipher.update(plainText, 'utf8'),
        cipher.final()
      ]);

      const tag = cipher.getAuthTag();

      // Nối chuỗi theo thứ tự: IV + Dữ liệu đã mã hóa + Tag xác thực
      return Buffer.concat([iv, encrypted, tag]).toString('base64');
    } catch (error) {
      throw new InternalServerErrorException('Encryption failed: ' + error.message);
    }
  }

  /**
   * Giải mã AES-GCM từ Java hoặc NestJS gửi sang
   */
  decrypt(cipherTextBase64: string): string {
    if (!cipherTextBase64) return cipherTextBase64;

    try {
      const dek = this.keyHolderService.getDek();
      const data = Buffer.from(cipherTextBase64, 'base64');

      // Tách IV, Tag và Ciphertext từ Buffer
      const iv = data.subarray(0, this.IV_LENGTH);
      const tag = data.subarray(data.length - this.TAG_LENGTH);
      const encrypted = data.subarray(this.IV_LENGTH, data.length - this.TAG_LENGTH);

      const decipher = crypto.createDecipheriv(this.ALGORITHM, dek, iv);
      decipher.setAuthTag(tag);

      const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final()
      ]);

      return decrypted.toString('utf8');
    } catch (error) {
      throw new InternalServerErrorException('Decryption failed: ' + error.message);
    }
  }
}