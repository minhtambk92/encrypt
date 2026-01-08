// src/crypto/services/crypto-manipulation.service.ts
import { Injectable } from '@nestjs/common';
import { CipherService } from './cipher.service';
import { HmacService } from './hmac.service';
import { BigramService } from './bigram.service';
import { CspService } from './csp.service';
import { CRYPTO_TARGET, CRYPTO_FIELD, CRYPTO_HASH_FIELD, CRYPTO_BIGRAM_FIELD, BigramOptions } from '../decorators/crypto.decorator';

@Injectable()
export class CryptoTargetManipulationService {
  constructor(
    private cipherService: CipherService,
    private hmacService: HmacService,
    private bigramService: BigramService,
    private cspService: CspService,
  ) {}

  async manipulate(obj: any, mode: 'encrypt' | 'decrypt') {
    if (!obj || typeof obj !== 'object') return;
    const target = Array.isArray(obj) ? obj[0] : obj;
    if (!target) return;

    const isCryptoTarget = Reflect.getMetadata(CRYPTO_TARGET, target.constructor);
    if (!isCryptoTarget) return;

    const dek = await this.cspService.getDek();

    if (Array.isArray(obj)) {
      for (const item of obj) await this.processFields(item, dek, mode);
    } else {
      await this.processFields(obj, dek, mode);
    }
  }

  private async processFields(obj: any, dek: string, mode: 'encrypt' | 'decrypt') {
    const proto = obj.constructor;
    
    // 1. Xử lý CryptoField (Mã hóa đối xứng)
    const cryptoFields = Reflect.getMetadata(CRYPTO_FIELD, proto) || {};
    for (const field in cryptoFields) {
      obj[field] = mode === 'encrypt' 
        ? this.cipherService.encrypt(obj[field], dek)
        : this.cipherService.decrypt(obj[field], dek);
    }

    // 2. Xử lý CryptoHashField (HMAC) - Thường chỉ lúc encrypt (Insert/Update)
    if (mode === 'encrypt') {
       const hashFields = Reflect.getMetadata(CRYPTO_HASH_FIELD, proto) || {};
       for (const field in hashFields) {
         obj[field] = this.hmacService.hash(obj[field], dek);
       }

       // 3. Xử lý CryptoHashBigramField
       const bigramFields = Reflect.getMetadata(CRYPTO_BIGRAM_FIELD, proto) || {};
       for (const field in bigramFields) {
         const options: BigramOptions = bigramFields[field];
         const sourceValue = obj[options.targetFieldName];
         obj[field] = this.bigramService.process(sourceValue, options.includingBigram);
       }
    }
  }
}