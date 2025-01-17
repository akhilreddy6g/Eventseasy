import { Module } from '@nestjs/common';
import { LogInfoService } from './logger.service';

@Module({
  providers: [LogInfoService],
  exports: [LogInfoService]
})
export class LoggerModule {}
