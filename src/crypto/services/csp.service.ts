// src/crypto/services/csp.service.ts
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import * as crypto from 'crypto';
import { firstValueFrom } from 'rxjs';
import { DekRequest } from '../dto/dek-request.dto';
import { DekResponse } from '../dto/dek-response.dto';

@Injectable()
export class CspService {
  private readonly logger = new Logger(CspService.name);
  
  // Cache lưu trữ DEK dưới dạng Buffer (byte array)
  private dekCache = new Map<string, Buffer>();
  
  private privateKey: crypto.KeyObject;
  private publicKey: crypto.KeyObject;

  private readonly KMS_URL = process.env.KMS_URL || 'https://kms-provider.com/v1/get-dek';

  constructor(private readonly httpService: HttpService) {
    this.generateKeyPair();
  }

  private generateKeyPair(): void {
    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
    });
    this.privateKey = privateKey;
    this.publicKey = publicKey;
    this.logger.log('Đã khởi tạo xong KeyPair RSA 2048.');
  }

  private getEncodedPublicKey(): string {
    return this.publicKey.export({
      type: 'spki',
      format: 'der',
    }).toString('base64');
  }

  /**
   * Sửa lại hàm getDek theo logic Java: 
   * Base64.getDecoder().decode(decryptDek(encryptDex, keyPair))
   */
  async getDek(keyName: string): Promise<Buffer> {
    if (this.dekCache.has(keyName)) {
      return this.dekCache.get(keyName) || Buffer.alloc(0);
    }

    try {
      const dekRequest = new DekRequest(this.getEncodedPublicKey());

      // 1. Lấy dữ liệu đã parse từ Hex (Tương đương HexFormat.of().parseHex)
      const encryptedDekBuffer = await this.fetchEncryptedDekFromKms(keyName, dekRequest);

      // 2. Giải mã RSA bằng Private Key
      // Kết quả trả về từ RSA Decrypt trong trường hợp này là một chuỗi Base64 (theo logic Java của anh)
      const base64DecryptedString = this.decryptDekWithRsa(encryptedDekBuffer);

      // 3. Giải mã Base64 để lấy byte array cuối cùng (DEK thực tế)
      // Tương đương: Base64.getDecoder().decode(...)
      const finalDekBuffer = Buffer.from(base64DecryptedString, 'base64');

      this.dekCache.set(keyName, finalDekBuffer);
      return finalDekBuffer;

    } catch (error) {
      this.logger.error(`Lỗi lấy DEK cho key: ${keyName}`, error.stack);
      throw new InternalServerErrorException(`Failed to retrieve DEK for ${keyName}`);
    }
  }

  /**
   * Sửa lại hàm fetchEncryptedDekFromKms:
   * Trả về Buffer từ chuỗi Hex (Tương đương HexFormat.of().parseHex)
   */
  private async fetchEncryptedDekFromKms(keyName: string, requestBody: DekRequest): Promise<Buffer> {
    const url = `${this.KMS_URL}/${keyName}`;
    
    const { data } = await firstValueFrom(
      this.httpService.post<DekResponse>(url, requestBody)
    );

    if (!data || !data.cipherText) {
      throw new Error(`KMS trả về kết quả không hợp lệ cho key: ${keyName}`);
    }

    // Chuyển chuỗi Hex nhận từ KMS thành byte array (Buffer)
    // HexFormat.of().parseHex(dekResponse.cipherText)
    return Buffer.from(data.cipherText, 'hex');
  }

  /**
   * Giải mã RSA (Tương đương decryptDek trong Java)
   */
  private decryptDekWithRsa(encryptedBuffer: Buffer): string {
    const decryptedBuffer = crypto.privateDecrypt(
      {
        key: this.privateKey,
        padding: crypto.constants.RSA_PKCS1_PADDING, 
      },
      encryptedBuffer
    );

    // Chuyển kết quả giải mã RSA thành chuỗi (đây là chuỗi Base64 trước khi decode bước cuối)
    return decryptedBuffer.toString('utf8');
  }
}