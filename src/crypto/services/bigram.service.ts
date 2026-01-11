// src/crypto/services/bigram.service.ts
import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { KeyHolderService } from './key-holder.service';

@Injectable()
export class BigramService {
  private readonly ALGORITHM = 'sha256';

  constructor(private readonly keyHolderService: KeyHolderService) {}

  /**
   * Logic chính xử lý Bigram Hash
   * @param text Dữ liệu gốc (plaintext)
   * @param includingBigram Có thực hiện băm bigram hay không
   * @returns Chuỗi tập hợp các hash bigram kèm vị trí
   */
  process(text: string, includingBigram: boolean): string|null {
    if (!text || !includingBigram) return null;

    // 1. Chuẩn hóa dữ liệu (giống Java HmacService)
    const normalizedData = text.trim().toLowerCase();
    
    // 2. Tạo danh sách Bigrams kèm vị trí
    const bigramsWithLocation = this.generateBigramsWithLocation(normalizedData);
    
    // 3. Băm từng Bigram kèm vị trí bằng HMAC
    const dek = this.keyHolderService.getDek();
    const hashedBigrams = bigramsWithLocation.map((item) => {
      const hash = crypto
        .createHmac(this.ALGORITHM, dek)
        .update(`${item.bigram}${item.position}`, 'utf8')
        .digest('hex');
      
      // Chỉ lấy một phần của hash (ví dụ 8-16 ký tự) để tiết kiệm dung lượng DB 
      // nếu Java của anh có quy định độ dài. Ở đây em để full.
      return hash;
    });

    // 4. Nối các mã hash bằng dấu cách hoặc ký tự phân tách (separator)
    return hashedBigrams.join(' ');
  }

  /**
   * Chia chuỗi thành các cặp 2 ký tự và ghi lại vị trí xuất hiện
   * Ví dụ: "mita" -> [{bigram: "mi", position: 0}, {bigram: "it", position: 1}, {bigram: "ta", position: 2}]
   */
  private generateBigramsWithLocation(text: string): { bigram: string; position: number }[] {
    if (text.length < 2) return [];

    const result: { bigram: string; position: number }[] = [];
    for (let i = 0; i < text.length - 1; i++) {
      result.push({
        bigram: text.substring(i, i + 2),
        position: i,
      });
    }
    return result;
  }
}