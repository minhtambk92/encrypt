// src/crypto/decorators/crypto.decorator.ts
import 'reflect-metadata';

export const CRYPTO_TARGET = 'crypto:target';
export const CRYPTO_FIELD = 'crypto:field';
export const CRYPTO_HASH_FIELD = 'crypto:hash_field';
export const CRYPTO_BIGRAM_FIELD = 'crypto:bigram_field';

export const CryptoTarget = () => ReflectMetadata(CRYPTO_TARGET, true);
export const CryptoField = () => ReflectMetadata(CRYPTO_FIELD, true);
export const CryptoHashField = () => ReflectMetadata(CRYPTO_HASH_FIELD, true);

export interface BigramOptions {
  targetFieldName: string;
  includingBigram: boolean;
}
export const CryptoHashBigramField = (options: BigramOptions) => 
  ReflectMetadata(CRYPTO_BIGRAM_FIELD, options);

// Helper function để bọc ReflectMetadata của NestJS
function ReflectMetadata(key: string, value: any) {
  return (target: any, propertyKey?: string) => {
    if (propertyKey) {
      // Field-level
      const metadata = Reflect.getMetadata(key, target) || {};
      metadata[propertyKey] = value;
      Reflect.defineMetadata(key, metadata, target);
    } else {
      // Class-level
      Reflect.defineMetadata(key, value, target);
    }
  };
}