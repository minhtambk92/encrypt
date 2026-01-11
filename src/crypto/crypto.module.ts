import { ConfigModule } from '@nestjs/config';
import { Module, Global } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CspService } from './services/csp.service';
import { KeyHolderService } from './services/key-holder.service';
import { CipherService } from './services/cipher.service';
import { HmacService } from './services/hmac.service';
import { BigramService } from './services/bigram.service';
import { CryptoTargetManipulationService } from './services/crypto-manipulation.service';
import { KeyRotationTask } from './tasks/key-rotation.task';
import { CryptoSubscriber } from './subscribers/crypto.subscriber';
// import {CryptoService} from "./crypto.service";

@Module({
    imports: [
        ConfigModule,
        HttpModule,
        ScheduleModule.forRoot(),
    ],
    providers: [
        // CryptoService,
        CspService,
        KeyHolderService,
        CipherService,
        HmacService,
        BigramService,
        CryptoTargetManipulationService,
        KeyRotationTask,
        CryptoSubscriber,
    ],
    exports: [
        // CryptoService,
        CipherService,
        HmacService,
        BigramService,
        CryptoTargetManipulationService,
    ],
})
export class CryptoModule {
}
