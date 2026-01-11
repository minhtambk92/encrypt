// src/crypto/subscribers/crypto.subscriber.ts
import { DataSource, EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent } from 'typeorm';
import { CryptoTargetManipulationService } from '../services/crypto-manipulation.service';

@EventSubscriber()
export class CryptoSubscriber implements EntitySubscriberInterface {
  constructor(
    dataSource: DataSource,
    private manipulationService: CryptoTargetManipulationService,
  ) {
    // Đăng ký Subscriber này vào hệ thống của TypeORM
    dataSource.subscribers.push(this);
  }

  /**
   * Tương tự logic "Before Query" trong MyBatis để mã hóa
   * Tự động mã hóa trước khi INSERT bản ghi mới
   * Tương đương: App (Plaintext) -> DB (Ciphertext/Hash)
   */
  async beforeInsert(event: InsertEvent<any>) {
    if (event.entity) {
      await this.manipulationService.manipulate(event.entity, 'encrypt');
    }
  }

  /**
   * Tự động mã hóa trước khi UPDATE bản ghi hiện có
   */
  async beforeUpdate(event: UpdateEvent<any>) {
    if (event.entity) {
      await this.manipulationService.manipulate(event.entity, 'encrypt');
    }
  }

  /**
   * Tương tự logic "After Query" trong MyBatis để giải mã
   * Tự động giải mã sau khi dữ liệu được load từ PostgreSQL lên
   * Tương đương: DB (Ciphertext) -> App (Plaintext)
   */
  async afterLoad(entity: any) {
    await this.manipulationService.manipulate(entity, 'decrypt');
  }
}