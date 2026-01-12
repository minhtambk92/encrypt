// src/crypto/services/crypto-manipulation.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { 
  CRYPTO_TARGET, 
  CRYPTO_FIELD, 
  CRYPTO_HASH_FIELD, 
  CRYPTO_BIGRAM_FIELD,
  BigramOptions,
  HashOptions
} from '../decorators/crypto.decorator';
import { CipherService } from './cipher.service';
import { HmacService } from './hmac.service';
import { BigramService } from './bigram.service';

@Injectable()
export class CryptoTargetManipulationService {
  private readonly logger = new Logger(CryptoTargetManipulationService.name);

  constructor(
    private readonly cipherService: CipherService,
    private readonly hmacService: HmacService,
    private readonly bigramService: BigramService,
  ) {}

  /**
   * Hàm điều phối chính (Tương đương logic trong Java)
   * @param obj Đối tượng cần xử lý (Entity hoặc DTO)
   * @param mode Chế độ 'encrypt' (trước khi lưu) hoặc 'decrypt' (sau khi lấy lên)
   */
  async manipulate(obj: any, mode: 'encrypt' | 'decrypt'): Promise<void> {
    if (!obj || typeof obj !== 'object') return;

    // Xử lý nếu là mảng (ví dụ: kết quả trả về từ findMany)
    if (Array.isArray(obj)) {
      for (const item of obj) {
        await this.processObject(item, mode);
      }
    } else {
      await this.processObject(obj, mode);
    }
  }

  private async processObject(obj: any, mode: 'encrypt' | 'decrypt'): Promise<void> {
    const targetClass = obj.constructor;

    // 1. Kiểm tra xem Class có đánh dấu @CryptoTarget không
    const isCryptoTarget = Reflect.getMetadata(CRYPTO_TARGET, targetClass);
    if (!isCryptoTarget) return;

    // 2. Lấy danh sách các fields cần xử lý từ Metadata
    const cryptoFields = Reflect.getMetadata(CRYPTO_FIELD, obj) || {};
    const hashFields = Reflect.getMetadata(CRYPTO_HASH_FIELD, obj) || {};
    const bigramFields = Reflect.getMetadata(CRYPTO_BIGRAM_FIELD, obj) || {};

    try {
      if (mode === 'encrypt') {
        await this.handleEncryption(obj, cryptoFields, hashFields, bigramFields);
      } else {
        await this.handleDecryption(obj, cryptoFields);
      }
    } catch (error) {
      this.logger.error(`Lỗi thao tác dữ liệu crypto ở chế độ ${mode}`, error.stack);
      throw error;
    }
  }

  /**
   * Logic xử lý khi ENCRYPT (Lưu xuống DB)
   */
  private async handleEncryption(obj: any, cryptoFields: any, hashFields: any, bigramFields: any) {
    // A. Mã hóa AES-GCM cho các trường @CryptoField
    for (const field in cryptoFields) {
      if (obj[field]) {
        obj[field] = this.cipherService.encrypt(obj[field]);
      }
    }

    // B. Tạo HMAC-SHA256 cho các trường @CryptoHashField (Blind Index)
   for (const targetField in hashFields) {
    const options: HashOptions = hashFields[targetField];
    let sourceValue = obj[options.targetFieldName];
    
    if (sourceValue && typeof sourceValue === 'string') {
        // Thực hiện trim nếu được yêu cầu
        if (options.trim) {
          sourceValue = sourceValue.trim();
        }
        
        // Gán giá trị băm vào trường đích (ví dụ: emailHash)
        obj[targetField] = this.hmacService.hash(sourceValue);
      }
    }

    // C. Tạo Bigram Hash cho các trường @CryptoHashBigramField
    for (const field in bigramFields) {
      const options: BigramOptions = bigramFields[field];
      const sourceValue = obj[options.targetFieldName]; // Lấy plaintext từ trường gốc
      
      if (sourceValue) {
        obj[field] = this.bigramService.process(sourceValue, options.includingBigram);
      }
    }
  }

  /**
   * Logic xử lý khi DECRYPT (Lấy từ DB lên)
   */
  private async handleDecryption(obj: any, cryptoFields: any) {
    // Chỉ giải mã các trường @CryptoField
    // Các trường Hash (HMAC/Bigram) không cần giải mã vì chúng là mã băm một chiều
    for (const field in cryptoFields) {
      if (obj[field]) {
        obj[field] = this.cipherService.decrypt(obj[field]);
      }
    }
  }
}