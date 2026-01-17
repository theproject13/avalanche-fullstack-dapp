import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { EventLogService } from './event-log.service';
import { EventLog } from './event-log.schema';

@Controller('event-logs')
export class EventLogController {
  constructor(private readonly service: EventLogService) {}

  @Post()
  create(@Body() body: Partial<EventLog>) {
    return this.service.create(body);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
