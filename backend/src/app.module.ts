import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthMiddleware } from './auth/middleware/auth.middleware';
import { LogInfoService } from './auth/logger/logger.service';
import { ConfigModule } from '@nestjs/config';
import { InviteModule } from './invite/invite.module';

@Module({
  imports: [AuthModule,
  InviteModule,
  MongooseModule.forRoot('mongodb://localhost:27017/Eventseasy'),
  ConfigModule.forRoot({
    isGlobal: true,
  }), 
  ],
  providers: [AuthMiddleware, LogInfoService]
})

export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(
      { path: 'events/conf', method: RequestMethod.ALL }
    );}
}
