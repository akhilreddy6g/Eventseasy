import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthMiddleware } from './auth/middleware/auth.middleware';
import { LogInfoService } from './auth/logger/logger.service';
import { ConfigModule} from '@nestjs/config';
import { InviteModule } from './invite/invite.module';
import { RedisModule } from './redis/redis.module';
import { ChatsModule } from './chats/chats.module';
import { KafkaModule } from './kafka/kafka.module'; 
import { AwakeModule } from './awake/awake.module';


@Module({
  imports: [AuthModule,
  InviteModule,
  MongooseModule.forRoot(process.env.MONGO_URI),
  ConfigModule.forRoot({
    isGlobal: true,
  }),
  RedisModule,
  ChatsModule,
  KafkaModule,
  AwakeModule
  ],
  providers: [AuthMiddleware, LogInfoService],
})

export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(
      { 
        path: 'events/*', 
        method: RequestMethod.ALL 
      },
      {
        path: 'chats/*',
        method: RequestMethod.ALL,
      },
      {
        path: 'invite/*',
        method: RequestMethod.ALL,
      },
    );}
}
