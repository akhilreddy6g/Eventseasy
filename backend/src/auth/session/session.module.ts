import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { LoggerModule } from '../logger/logger.module';

@Module({
    providers: [SessionService],
    exports: [SessionService],
    imports: [LoggerModule]
})
export class SessionModule{}
