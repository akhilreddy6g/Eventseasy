import { Module } from '@nestjs/common';
import { KafkaService } from './kafka.service';
import { LoggerModule } from 'src/auth/logger/logger.module';

@Module({
    providers: [KafkaService],
    imports: [LoggerModule]
})
export class KafkaModule {}
