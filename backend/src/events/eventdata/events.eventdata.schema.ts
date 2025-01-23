import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type EventDocument = HydratedDocument<Event>;
export type AttendeeDocument = HydratedDocument<Attendant>

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

@Schema({ versionKey: false })
export class Attendant {
  @Prop()
  _id: string

  @Prop()
  user: string

  @Prop()
  entryCode: string

  @Prop()
  accType: string

  @Prop()
  access: boolean
}

export const EventSchema = SchemaFactory.createForClass(Event);
export const AttendeeSchema = SchemaFactory.createForClass(Attendant);
