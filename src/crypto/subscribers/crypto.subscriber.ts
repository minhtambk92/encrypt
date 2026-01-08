// src/crypto/subscribers/crypto.subscriber.ts
import { DataSource, EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent } from 'typeorm';
import { CryptoTargetManipulationService } from '../services/crypto-manipulation.service';

@EventSubscriber()
export class TypeOrmCryptoSubscriber implements EntitySubscriberInterface {
  constructor(
    dataSource: DataSource,
    private manipulationService: CryptoTargetManipulationService,
  ) {
    dataSource.subscribers.push(this);
  }

  // Tương tự logic "Before Query" trong MyBatis để mã hóa
  async beforeInsert(event: InsertEvent<any>) {
    await this.manipulationService.manipulate(event.entity, 'encrypt');
  }

  async beforeUpdate(event: UpdateEvent<any>) {
    await this.manipulationService.manipulate(event.entity, 'encrypt');
  }

  // Tương tự logic "After Query" trong MyBatis để giải mã
  async afterLoad(entity: any) {
    await this.manipulationService.manipulate(entity, 'decrypt');
  }
}