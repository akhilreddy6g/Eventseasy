import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthMiddleware } from './auth/middleware/auth.middleware';
import { LogInfoService } from './auth/logger/logger.service';
import { ConfigModule} from '@nestjs/config';
import { InviteModule } from './invite/invite.module';
import { RedisModule } from './redis/redis.module';
import { ChatsModule } from './chats/chats.module';
import { MessageModule } from './message/message.module';
import { KafkaModule } from './kafka/kafka.module'; 


@Module({
  imports: [AuthModule,
  InviteModule,
  MongooseModule.forRoot(process.env.MONGO_URI),
  ConfigModule.forRoot({
    isGlobal: true,
  }),
  RedisModule,
  ChatsModule,
  MessageModule,
  KafkaModule
  ],
  providers: [AuthMiddleware, LogInfoService],
})

export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(
      { path: 'events/data', method: RequestMethod.ALL }
    );}
}
