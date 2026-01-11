// src/crypto/services/csp.service.ts
import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as forge from 'node-forge';
import { DekRequest } from '../dto/dek-request.dto';
import { DekResponse } from '../dto/dek-response.dto';

@Injectable()
export class CspService {
  private readonly logger = new Logger(CspService.name);
  
  // Lưu trữ KeyPair theo chuẩn của forge
  private keyPair: forge.pki.rsa.KeyPair;

  constructor(private readonly httpService: HttpService) {}

  /**
   * Tương đương KeyPairGenerator(2048) của Java
   */
  private generateKeyPair(): void {
    // Sinh cặp khóa RSA 2048 bits
    this.keyPair = forge.pki.rsa.generateKeyPair(2048);
    this.logger.log('Đã sinh cặp RSA KeyPair 2048 bằng node-forge.');
  }

  /**
   * Tương đương keypair.getPublic().getEncoded() trong Java
   * Xuất ra định dạng SubjectPublicKeyInfo (X.509) DER -> Base64
   */
  private getEncodedPublicKey(): string {
    const asn1 = forge.pki.publicKeyToAsn1(this.keyPair.publicKey);
    const der = forge.asn1.toDer(asn1).getBytes();
    return forge.util.encode64(der);
  }

  async getDek(keyName: string): Promise<Buffer> {
    this.generateKeyPair();
    const encodedPublicKey = this.getEncodedPublicKey();
    const dekRequest = new DekRequest(encodedPublicKey);
    
    // 1. Lấy dữ liệu Hex từ KMS
    const encryptedDekHex = await this.fetchEncryptedDekFromKms(keyName, dekRequest);

    // 2. Giải mã RSA PKCS1 v1.5 (Khớp với Java "RSA")
    const base64DecryptedString = this.decryptWithForge(encryptedDekHex);

    // 3. Trả về Buffer cuối cùng
    return Buffer.from(base64DecryptedString, 'base64');
  }

  /**
   * Giải mã bằng thuật toán RSA ES PKCS1 v1.5
   * Không phụ thuộc vào OpenSSL của hệ thống
   */
  private decryptWithForge(encryptedHex: string): string {
    try {
      const encryptedBytes = forge.util.hexToBytes(encryptedHex);
      
      // Giải mã với scheme RSAES-PKCS1-V1_5 (Tương đương RSA/ECB/PKCS1Padding)
      const decrypted = this.keyPair.privateKey.decrypt(encryptedBytes, 'RSAES-PKCS1-V1_5');
      
      return decrypted.toString();
    } catch (error) {
      this.logger.error(`Lỗi giải mã Forge: ${error.message}`);
      throw new InternalServerErrorException('RSA Decryption failed with Forge');
    }
  }

  private async fetchEncryptedDekFromKms(keyName: string, requestBody: DekRequest): Promise<string> {
    const url = `${process.env.KMS_URL}/${keyName}`;
    const { data } = await firstValueFrom(this.httpService.post<DekResponse>(url, requestBody));
    return data.cipherText; // Giữ nguyên chuỗi Hex nhận từ KMS
  }
}