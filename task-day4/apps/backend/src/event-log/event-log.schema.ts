import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type EventLogDocument = HydratedDocument<EventLog>;

@Schema({ timestamps: true })
export class EventLog {
  @Prop({ required: true })
  event: string;

  @Prop({ type: Object })
  payload: Record<string, any>;

  @Prop({ required: false })
  txHash?: string;

  @Prop({ required: false })
  blockNumber?: number;
}

export const EventLogSchema = SchemaFactory.createForClass(EventLog);
