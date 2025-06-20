import { Module } from '@nestjs/common';
import { ChatsController } from './chats.controller';
import { ChatsService } from './chats.service';
import { LoggerModule } from 'src/auth/logger/logger.module';
import { EventsModule } from 'src/events/events.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Viewer, ViewerSchema } from 'src/events/eventdata/events.eventdata.schema';
import { Chat, Chat_Restricted_User, Chat_Restricted_UserSchema, ChatSchema } from './chatdata/chats.chatdata.schema';

@Module({
    controllers: [ChatsController],
    providers: [ChatsService],
    imports: [LoggerModule, EventsModule, 
         MongooseModule.forFeature([{ name: Viewer.name, schema: ViewerSchema}]),
         MongooseModule.forFeature([{ name: Chat.name, schema: ChatSchema}]),
         MongooseModule.forFeature([{ name: Chat_Restricted_User.name, schema: Chat_Restricted_UserSchema}])
    ]
})
export class ChatsModule {}
