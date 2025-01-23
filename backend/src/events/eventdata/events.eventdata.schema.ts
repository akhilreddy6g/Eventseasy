import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type EventDocument = HydratedDocument<Event>;

@Schema({ versionKey: false })
export class Event {
  @Prop()
  _id: string

  @Prop()
  startDate: Date

  @Prop()
  endDate: Date

  @Prop()
  startTime: string

  @Prop()
  endTime: string

  @Prop()
  user: string;

  @Prop()
  accType: string

  @Prop()
  event: string
}

export const EventSchema = SchemaFactory.createForClass(Event);
