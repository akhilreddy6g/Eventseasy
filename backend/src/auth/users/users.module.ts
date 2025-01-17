import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schema/users.schema';
import { LoggerModule } from '../logger/logger.module';
import { SessionModule } from '../session/session.module';

@Module({
  providers: [UsersService],
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema}]),
    LoggerModule,
    SessionModule
  ],
  exports: [UsersService]
})
export class UsersModule {}
