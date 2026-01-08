// src/crypto/dto/dek-request.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class DekRequest {
  @IsString()
  @IsNotEmpty()
  encodedPublicKey: string; // Public Key của app mình gửi lên cho CSP

  constructor(encodedPublicKey: string) {
    this.encodedPublicKey = encodedPublicKey;
  }
}