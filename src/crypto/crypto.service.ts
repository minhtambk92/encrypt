// src/crypto/crypto.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class CryptoService {
    private readonly algorithm = 'aes-256-gcm'; // Thuật toán mã hoá hiện đại
    private readonly key: Buffer; // Key mã hoá (32 bytes)
    private readonly hmacKey: string; // Key cho HMAC

    constructor(private configService: ConfigService) {
        const encryptionKey = this.configService.get<string>('ENCRYPTION_KEY');
        if (!encryptionKey || encryptionKey.length !== 32) {
            throw new Error('ENCRYPTION_KEY phải là 32 ký tự.');
        }
        this.key = Buffer.from(encryptionKey, 'utf-8');
        this.hmacKey = this.configService.get<string>('HMAC_KEY') || '';
    }

    /**
     * Mã hoá dữ liệu (Non-deterministic)
     * Dùng IV (Initialization Vector) ngẫu nhiên
     */
    encrypt(text: string): string {
        const iv = crypto.randomBytes(16); // Tạo IV ngẫu nhiên (16 bytes)
        const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

        const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
        const authTag = cipher.getAuthTag();

        // Ghép IV, AuthTag, và Ciphertext lại để lưu
        // Format: [iv].[authTag].[encrypted]
        return `${iv.toString('hex')}.${authTag.toString('hex')}.${encrypted.toString('hex')}`;
    }

    /**
     * Giải mã dữ liệu
     */
    decrypt(encryptedText: string): string|null {
        try {
            const parts = encryptedText.split('.');
            if (parts.length !== 3) {
                throw new Error('Định dạng chuỗi mã hoá không hợp lệ');
            }

            const iv = Buffer.from(parts[0], 'hex');
            const authTag = Buffer.from(parts[1], 'hex');
            const encrypted = Buffer.from(parts[2], 'hex');

            const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
            decipher.setAuthTag(authTag);

            const decrypted = Buffer.concat([decipher.update(encrypted.toString('hex'), 'hex'), decipher.final()]);
            return decrypted.toString('utf8');
        } catch (error) {
            console.error('Giải mã thất bại:', error.message);
            return null; // Hoặc throw lỗi
        }
    }

    /**
     * Tạo "Blind Index" dùng HMAC (Deterministic)
     * Dùng để search
     */
    hmac(text: string): string {
        return crypto
            .createHmac('sha256', this.hmacKey)
            .update(text)
            .digest('hex');
    }
}