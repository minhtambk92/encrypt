// src/user/user.service.ts
import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { CryptoService } from '../crypto/crypto.service'; // Import CryptoService
import { CreateUserDto } from './dto/create-user.dto';

// Định nghĩa cấu trúc data sẽ lưu trong ES
interface UserDocument {
    username: string;
    email_encrypted?: string;
    email_hash?: string;
    phone_number_encrypted?: string;
    phone_number_hash?: string;
    address_encrypted?: string;
}

@Injectable()
export class UserService {
    private readonly indexName = 'users';

    constructor(
        private readonly esService: ElasticsearchService,
        private readonly cryptoService: CryptoService, // Inject vào
    ) {}

    /**
     * TẠO USER (Encrypt và Hash)
     */
    async createUser(createUserDto: CreateUserDto): Promise<any> {
        const { username, email, phone_number, address } = createUserDto;

        const doc: UserDocument = {
            username: username,
        };

        // 1. Mã hoá Email
        if (email) {
            doc.email_encrypted = this.cryptoService.encrypt(email);
            doc.email_hash = this.cryptoService.hmac(email.toLowerCase()); // Luôn hash chữ thường
        }

        // 2. Mã hoá Phone
        if (phone_number) {
            doc.phone_number_encrypted = this.cryptoService.encrypt(phone_number);
            doc.phone_number_hash = this.cryptoService.hmac(phone_number);
        }

        // 3. Mã hoá Address (không hash vì không search)
        if (address) {
            doc.address_encrypted = this.cryptoService.encrypt(address);
        }

        // 4. Lưu vào Elasticsearch
        return this.esService.index({
            index: this.indexName,
            document: doc,
        });
    }

    /**
     * TÌM USER BẰNG EMAIL (Search bằng Blind Index)
     */
    async findByEmail(email: string): Promise<any> {
        // 1. Tạo hash để search
        const searchHash = this.cryptoService.hmac(email.toLowerCase());

        // 2. Query ES
        const { hits } = await this.esService.search({
            index: this.indexName,
            query: {
                term: {
                    'email_hash': searchHash,
                },
            },
        });

        if (hits.hits.length === 0) {
            return null; // Không tìm thấy
        }

        // 3. Giải mã dữ liệu trước khi trả về
        const userDoc = hits.hits[0]._source as UserDocument;
        return this._decryptUser(userDoc);
    }

    async findByUsername(username: string): Promise<any> {
        const { hits } = await this.esService.search({
            index: this.indexName,
            query: {
                term: {
                    'username': username,
                },
            },
        });

        if (hits.hits.length === 0) {
            return null; // Không tìm thấy
        }

        const userDoc = hits.hits[0]._source as UserDocument;
        return this._decryptUser(userDoc);
    }

    /**
     * Hàm helper để giải mã
     */
    private _decryptUser(userDoc: UserDocument): any {
        const decryptedUser: any = { username: userDoc.username };

        if (userDoc.email_encrypted) {
            decryptedUser.email = this.cryptoService.decrypt(userDoc.email_encrypted);
        }
        if (userDoc.phone_number_encrypted) {
            decryptedUser.phone_number = this.cryptoService.decrypt(userDoc.phone_number_encrypted);
        }
        if (userDoc.address_encrypted) {
            decryptedUser.address = this.cryptoService.decrypt(userDoc.address_encrypted);
        }

        return decryptedUser;
    }
}