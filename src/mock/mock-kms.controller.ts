// src/mock/mock-kms.controller.ts
import { Controller, Post, Body, Param, Logger, Get } from '@nestjs/common';
import * as forge from 'node-forge';

@Controller('v1/get-dek')
export class MockKmsController {
  private readonly logger = new Logger(MockKmsController.name);

  // DEK mẫu cố định để anh dễ đối chiếu kết quả giữa NestJS và Java
  // Trong thực tế, anh có thể dùng crypto.randomBytes(32)
  private readonly MOCK_DEK_PLAINTEXT = 'ThisIsMySecretDEK_32BytesLength!';

  @Get(':test')
  test() {
    return 'Mock KMS is running';
  }

  @Post(':keyName')
  getDek(@Param('keyName') keyName: string, @Body() body: { encodedPublicKey: string }) {
    this.logger.log(`Nhận yêu cầu lấy DEK cho key: ${keyName}`);

    try {
      const { encodedPublicKey } = body;

      // 1. Chuyển Public Key từ Base64 (DER) sang định dạng mà Node.js hiểu được
      const publicKey = forge.pki.publicKeyFromAsn1(forge.asn1.fromDer(forge.util.decode64(encodedPublicKey)));

      // 2. Chuẩn bị DEK: DEK thô -> Base64 string
      // (Vì logic Java của anh yêu cầu sau khi giải mã RSA phải ra một chuỗi Base64)
      const dekBase64 = Buffer.from(this.MOCK_DEK_PLAINTEXT).toString('base64');

      // 3. Mã hóa RSA (Sử dụng Public Key của App gửi lên)
      const encrypted = publicKey.encrypt(dekBase64, 'RSAES-PKCS1-V1_5');

      // 4. Chuyển sang định dạng HEX để trả về (Theo yêu cầu HexFormat bên Java)
      const cipherTextHex = forge.util.bytesToHex(encrypted);

      this.logger.log(`Đã tạo cipherText thành công cho ${keyName}`);
      
      return {
        cipherText: cipherTextHex,
      };
    } catch (error) {
      this.logger.error('Lỗi Mock KMS:', error.message);
      throw error;
    }
  }
}