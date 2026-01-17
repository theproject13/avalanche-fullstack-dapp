import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventLog, EventLogSchema } from './event-log.schema';
import { EventLogController } from './event-log.controller';
import { EventLogService } from './event-log.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EventLog.name, schema: EventLogSchema },
    ]),
  ],
  controllers: [EventLogController],
  providers: [EventLogService],
  exports: [MongooseModule, EventLogService],
})
export class EventLogModule {}
