import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventLog, EventLogDocument } from './event-log.schema';

@Injectable()
export class EventLogService {
  constructor(
    @InjectModel(EventLog.name) private readonly model: Model<EventLogDocument>,
  ) {}

  async create(input: Partial<EventLog>) {
    return this.model.create(input);
  }

  async findAll() {
    return this.model.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string) {
    const doc = await this.model.findById(id).exec();
    if (!doc) throw new NotFoundException('EventLog not found');
    return doc;
  }
}
