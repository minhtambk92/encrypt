// src/crypto/services/bigram.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class BigramService {
    process(sourceValue: any, includingBigram: boolean): any {
        throw new Error('Method not implemented.');
    }
    
    generateBigrams(text: string): string[] {
        if (!text || text.length < 2) return [] as string[];
        const bigrams: string[] = [];
        for (let i = 0; i < text.length - 1; i++) {
            bigrams.push(text.substring(i, i + 2));
        }
        return bigrams;
    }
    // Hash bigrams và lưu location tương tự Java
}