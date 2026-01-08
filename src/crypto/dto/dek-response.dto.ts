// src/crypto/dto/dek-response.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class DekResponse {
  @IsString()
  @IsNotEmpty()
  cipherText: string; // Khóa DEK đã bị mã hóa (thường là Base64)
}