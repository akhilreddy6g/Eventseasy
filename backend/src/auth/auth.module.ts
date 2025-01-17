import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from './users/users.module';
import { SessionModule } from './session/session.module';
import { LoggerModule } from './logger/logger.module';

@Module({
    controllers: [AuthController],
    providers: [AuthService],
    imports: [UsersModule, SessionModule, LoggerModule]
})
export class AuthModule {}
