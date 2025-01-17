import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthMiddleware } from './auth/middleware/auth.middleware';
import { LogInfoService } from './auth/logger/logger.service';

@Module({
  imports: [AuthModule,
  MongooseModule.forRoot('mongodb://localhost:27017/Eventseasy')],
  providers: [AuthMiddleware, LogInfoService]
})

export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes({ path: 'events', method: RequestMethod.ALL });
  }
}
