// test-encryption.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { CipherService } from './src/crypto/services/cipher.service';
import { HmacService } from './src/crypto/services/hmac.service';
import { BigramService } from './src/crypto/services/bigram.service';
import { KeyHolderService } from './src/crypto/services/key-holder.service';

async function bootstrap() {
  // 1. Khởi tạo Standalone Context
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const cipherService = app.get(CipherService);
  const hmacService = app.get(HmacService);
  const bigramService = app.get(BigramService);
  const keyHolderService = app.get(KeyHolderService);

  // 2. GIẢ LẬP DEK (Khớp với phía Java để so sánh)
  // Trong Java, có một DEK dạng chuỗi, hãy biến nó thành Buffer ở đây.
  // Ví dụ: DEK 32 bytes (AES-256)
  const mockDek = Buffer.from('this-is-a-32-character-key-12345', 'utf8'); 
  keyHolderService.updateDek(mockDek);

  const testData = 'cmc_lmtam@gmail.com';
  
  console.log('\n================================================');
  console.log('🚀 BẮT ĐẦU KIỂM TRA ĐỘ TƯƠNG ĐỒNG VỚI JAVA');
  console.log('================================================');
  console.log(`Dữ liệu gốc (Plaintext): ${testData}`);
  console.log(`DEK sử dụng (Hex): ${mockDek.toString('hex')}`);

  try {
    // --- TEST AES-GCM ---
    console.log('\n[1] KIỂM TRA CIPHER SERVICE (AES-GCM)');
    const encryptedBase64 = cipherService.encrypt(testData);
    console.log(`➜ Encrypted (Base64): ${encryptedBase64}`);
    
    const decrypted = cipherService.decrypt(encryptedBase64);
    console.log(`➜ Decrypted: ${decrypted}`);
    console.log(decrypted === testData ? '✅ Giải mã thành công!' : '❌ Lỗi giải mã!');

    // --- TEST HMAC-SHA256 ---
    console.log('\n[2] KIỂM TRA HMAC SERVICE (Blind Index)');
    const hmacHex = hmacService.hash(testData);
    console.log(`➜ HMAC (Hex): ${hmacHex}`);
    console.log('💡 Anh hãy so sánh chuỗi Hex này với kết quả HmacSHA256 từ Java.');

    // --- TEST BIGRAM ---
    console.log('\n[3] KIỂM TRA BIGRAM SERVICE');
    const bigramResult = bigramService.process(testData, true);
    console.log(`➜ Bigram Hashes: ${bigramResult}`);

    // --- TEST GIẢI MÃ CHUỖI TỪ JAVA ---
    // Anh Mita hãy lấy một chuỗi mã hóa từ Java (với cùng DEK trên) rồi dán vào đây để test
    const encryptedFromJava = ''; // <--- Dán chuỗi Base64 từ Java vào đây
    if (encryptedFromJava) {
      console.log('\n[4] KIỂM TRA GIẢI MÃ DỮ LIỆU TỪ JAVA');
      const decryptedJava = cipherService.decrypt(encryptedFromJava);
      console.log(`➜ Kết quả giải mã từ Java: ${decryptedJava}`);
    }

  } catch (error) {
    console.error('\n❌ Có lỗi xảy ra trong quá trình test:');
    console.error(error);
  } finally {
    console.log('\n================================================');
    await app.close();
  }
}

bootstrap();