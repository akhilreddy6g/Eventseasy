import { Module } from '@nestjs/common';
import { AwakeService } from './awake.service';
import { LoggerModule } from 'src/auth/logger/logger.module';
import { AwakeController } from './awake.controller';

@Module({
    controllers: [AwakeController],
    providers: [AwakeService],
    imports: [LoggerModule],
})
export class AwakeModule {}
