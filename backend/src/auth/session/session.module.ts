import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { LogInfoService } from '../logger/logger.service';

@Module({
    providers: [SessionService, LogInfoService],
    exports: [SessionService]
})
export class SessionModule{}
