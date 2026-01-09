// src/crypto/services/key-holder.service.ts
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CspService } from './csp.service';

@Injectable()
export class KeyHolderService implements OnModuleInit {
  private readonly logger = new Logger(KeyHolderService.name);
  private dek: Buffer; // Lưu byte array DEK

  constructor(
    private readonly configService: ConfigService,
    private readonly cspService: CspService,
  ) {}

  // Tự động chạy khi app khởi động
  async onModuleInit() {
    const keyName = this.configService.get<string>('KMS_AES_KEYNAME');
    if (!keyName) {
      this.logger.error('KMS_AES_KEYNAME không được định nghĩa trong .env');
      return;
    }

    // Lấy DEK từ CSP Service và lưu vào bộ nhớ
    this.dek = await this.cspService.getDek(keyName);
    this.logger.log(`Đã load và lưu DEK thành công cho key: ${keyName}`);
  }

  getDek(): Buffer {
    return this.dek;
  }
}