import * as path from "path";
import * as fs from "fs";
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import {ConfigModule, ConfigService} from "@nestjs/config";


export default ElasticsearchModule.registerAsync({
    imports: [ConfigModule],
    useFactory: async (configService: ConfigService) => {
        // 1. Lấy biến ra trước
        const esNode = configService.get<string>('ES_NODE');
        const esPassword = configService.get<string>('ES_PASSWORD');

        // 2. Kiểm tra
        if (!esNode || !esPassword) {
            throw new Error('Thiếu ES_NODE hoặc ES_PASSWORD trong file .env');
        }

        // Đường dẫn tới file certificate
        const certPath = path.join(process.cwd(), 'http_ca.crt');
        if (!fs.existsSync(certPath)) {
            throw new Error(`Không tìm thấy file certificate tại: ${certPath}`);
        }

        // 3. Trả về cấu hình
        return {
            node: esNode, // Chắc chắn esNode có giá trị
            maxRetries: 10,
            requestTimeout: 60000,
            // 1. Cấu hình xác thực (Auth)
            auth: {
                username: 'elastic', // User mặc định
                password: esPassword,
            },

            // 2. Cấu hình SSL/TLS
            tls: {
                // Đọc file certificate
                ca: fs.readFileSync(certPath),

                // Rất quan trọng: Bật kiểm tra certificate
                rejectUnauthorized: true,
            },

        };
    },
    inject: [ConfigService],
});
