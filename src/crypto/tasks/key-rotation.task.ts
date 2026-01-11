// src/crypto/tasks/key-rotation.task.ts
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Interval } from '@nestjs/schedule';
import { CspService } from '../services/csp.service';
import { KeyHolderService } from '../services/key-holder.service';

@Injectable()
export class KeyRotationTask implements OnModuleInit {
  private readonly logger = new Logger(KeyRotationTask.name);
  private readonly keyName: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly cspService: CspService,
    private readonly keyHolderService: KeyHolderService,
  ) {
    this.keyName = this.configService.get<string>('KMS_AES_KEYNAME') as string;
  }

  /**
   * Nạp khóa lần đầu tiên khi ứng dụng khởi động
   */
  async onModuleInit() {
    this.logger.log('Khởi tạo DEK lần đầu...');
    // Đợi khoảng 3-5 giây để app mở port 3000 xong xuôi
    this.logger.log('Đợi app khởi động xong để kết nối Mock KMS...');
    setTimeout(async () => {
        await this.rotate();
    }, 5000);
  }

  /**
   * Tác vụ chạy định kỳ để xoay vòng khóa
   * Thời gian interval lấy từ biến môi trường
   */
  @Interval('KEY_ROTATION_INTERVAL', Number(process.env.DEK_REFRESH_INTERVAL_MS) || 3600000)
  async handleRotation() {
    this.logger.log('Bắt đầu tiến trình xoay vòng khóa định kỳ...');
    await this.rotate();
  }

  /**
   * Luồng xử lý xoay vòng khóa chi tiết
   */
  private async rotate() {
    try {
      if (!this.keyName) {
        throw new Error('CRYPTO_KEY_NAME missing in .env');
      }

      // CspService không có cache, nên gọi getDek() lúc nào cũng là lấy mới
      const freshDek = await this.cspService.getDek(this.keyName);
      
      // Đẩy vào cache tập trung tại KeyHolder
      this.keyHolderService.updateDek(freshDek);
      
      this.logger.log('Xoay vòng khóa và cập nhật Cache thành công.');
    } catch (error) {
      this.logger.error(`Lỗi khi thực hiện xoay vòng khóa: ${error.message}`, error.stack);
      // Có thể bổ sung thêm logic gửi thông báo (Slack/Email) ở đây nếu xoay khóa lỗi
    }
  }
}