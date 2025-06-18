import { Module } from '@nestjs/common';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { LoggerModule } from 'src/auth/logger/logger.module';

@Module({
    controllers: [MessageController],
    providers: [MessageService],
    imports: [LoggerModule]
})
export class MessageModule {}
