// src/crypto/services/csp.service.ts
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { DekRequest } from '../dto/dek-request.dto';
import { DekResponse } from '../dto/dek-response.dto';

@Injectable()
export class CspService {
  private cachedDek: string;

  constructor(private httpService: HttpService) {}

  async getDek(): Promise<string> {
    if (this.cachedDek) return this.cachedDek;
    
    // Giả lập gọi đến CSP Service (DekRequest/Response)
    const { data } = await firstValueFrom(
      this.httpService.post<DekResponse>('https://csp-provider.com/get-dek', new DekRequest('<YourAppPublicKeyHere>'))
    );
    this.cachedDek = data.cipherText;
    return this.cachedDek;
  }
}