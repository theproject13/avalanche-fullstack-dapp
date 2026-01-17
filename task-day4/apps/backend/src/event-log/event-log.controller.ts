import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { EventLogService } from './event-log.service';
import { EventLog } from './event-log.schema';

@Controller('event-logs')
export class EventLogController {
  constructor(private readonly service: EventLogService) {}

  @Post()
  create(@Body() body: unknown) {
    // Be tolerant with payloads coming from various clients
    let data: any = body;

    // If body was sent as a JSON string, parse it
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch {
        // keep raw string; will be wrapped below
      }
    }

    // Ensure we have an object
    if (!data || typeof data !== 'object') {
      data = { event: 'Unknown', payload: { raw: body } };
    }

    // Ensure required field 'event' exists to satisfy schema
    if (!data.event) {
      data.event = 'Unknown';
    }

    // Coerce blockNumber to number if provided
    if (data.blockNumber != null) {
      const n = Number(data.blockNumber);
      if (!Number.isNaN(n)) data.blockNumber = n;
    }

    return this.service.create(data as Partial<EventLog>);
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
