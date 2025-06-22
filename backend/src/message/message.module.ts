import { Module } from '@nestjs/common';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { LoggerModule } from 'src/auth/logger/logger.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Chat_Servers, ChatServersSchema } from './messagedata/message.eventdata.schema';

@Module({
    controllers: [MessageController],
    providers: [MessageService],
    imports: [LoggerModule, 
        MongooseModule.forFeature([{name: Chat_Servers.name,schema: ChatServersSchema}])
    ]
})
export class MessageModule {}
