import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type EventDocument = HydratedDocument<Event>;
export type AttendeeDocument = HydratedDocument<Attendant>
export type ViewerDocument = HydratedDocument<Viewer>

@Schema({ versionKey: false })
export class Event {
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
  user: string

  @Prop()
  userName: string

  @Prop()
  accType: string

  @Prop()
  access: boolean

  @Prop()
  eventId: string
}

@Schema({ versionKey: false})
export class Viewer {

  @Prop()
  user: string

  @Prop()
  accType: string

  @Prop()
  eventId: string
}

export const EventSchema = SchemaFactory.createForClass(Event);
export const AttendeeSchema = SchemaFactory.createForClass(Attendant);
export const ViewerSchema = SchemaFactory.createForClass(Viewer);
