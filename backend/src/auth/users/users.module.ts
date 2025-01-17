import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schema/users.schema';
import { LogInfoService } from '../logger/logger.service';
import { SessionService } from '../session/session.service';

@Module({
  providers: [UsersService, LogInfoService, SessionService],
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema}])
  ],
  exports: [UsersService]
})
export class UsersModule {}
