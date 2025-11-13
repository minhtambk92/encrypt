// src/seed/seed.service.ts
import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { CryptoService } from '../crypto/crypto.service';
import { faker } from '@faker-js/faker';

@Injectable()
export class SeedService {
    private readonly indexName = 'users';

    constructor(
        private readonly esService: ElasticsearchService,
        private readonly cryptoService: CryptoService,
    ) {}

    async seedUsers(totalCount: number) {
        console.log(`Bắt đầu seed ${totalCount} users... (Việc này sẽ mất thời gian)`);
        const batchSize = 5000; // Insert 5000 user một lần
        let batchBody: any[] = []; // Mảng chứa các "lệnh" cho ES

        for (let i = 1; i <= totalCount; i++) {
            // 1. Tạo data giả
            const username = faker.internet.username().toLowerCase();
            const email = faker.internet.email().toLowerCase();
            const phone_number = faker.phone.number();
            const address = faker.location.streetAddress(true);

            // 2. Mã hoá và Hash (tốn CPU)
            const email_encrypted = this.cryptoService.encrypt(email);
            const email_hash = this.cryptoService.hmac(email);
            const phone_number_encrypted = this.cryptoService.encrypt(phone_number);
            const phone_number_hash = this.cryptoService.hmac(phone_number);
            const address_encrypted = this.cryptoService.encrypt(address);

            // 3. Chuẩn bị "action" cho _bulk API
            // Dòng "action"
            batchBody.push({
                index: { _index: this.indexName },
            });

            // Dòng "document"
            batchBody.push({
                username,
                email_encrypted,
                email_hash,
                phone_number_encrypted,
                phone_number_hash,
                address_encrypted,
            });

            // 4. Khi đủ 1 batch (lô) -> Đẩy vào ES
            if (i % batchSize === 0 || i === totalCount) {
                try {
                    await this.esService.bulk({
                        refresh: false, // Tăng tốc độ index
                        body: batchBody,
                    });
                    console.log(`Đã seed ${i} / ${totalCount} users...`);

                    // Reset mảng batch
                    batchBody = [];

                } catch (e) {
                    console.error(`Lỗi khi seed batch bắt đầu từ ${i - batchSize + 1}:`, e);
                }
            }
        }

        console.log('--- HOÀN TẤT SEED DATA ---');

        // Yêu cầu ES "làm mới" index để data có thể được search
        await this.esService.indices.refresh({ index: this.indexName });
        console.log('Index đã được refresh.');
    }
}