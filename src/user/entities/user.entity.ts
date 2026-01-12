// src/user/entities/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { 
  CryptoTarget, 
  CryptoField, 
  CryptoHashField, 
  CryptoHashBigramField 
} from '../../crypto/decorators/crypto.decorator';

@Entity('users')
@CryptoTarget() // Đánh dấu để Subscriber biết cần xử lý
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @CryptoField() // Sẽ được mã hóa AES-GCM
  @Column({ name: 'email_encrypted' })
  email: string;

  @CryptoHashField({ targetFieldName: 'email', trim: true }) // Sẽ được băm HMAC-SHA256 để search chính xác
  @Column({ name: 'email_hash' })
  emailHash: string;

  @CryptoHashBigramField({ targetFieldName: 'email', includingBigram: true })
  @Column({ name: 'email_bigram', type: 'text' })
  emailBigram: string; // Sẽ lưu các Bigram Hash để search LIKE
}