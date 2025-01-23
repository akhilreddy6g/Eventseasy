import { Module } from "@nestjs/common";
import { CreateEvents } from "./events.controller";
import { EventService } from "./events.service";
import { LoggerModule } from "src/auth/logger/logger.module";
import { Attendant, AttendeeSchema, Event, EventSchema } from "./eventdata/events.eventdata.schema";
import { MongooseModule } from "@nestjs/mongoose";

@Module({
    controllers: [CreateEvents],
    providers: [EventService],
    imports: [MongooseModule.forFeature([{ name: Event.name, schema: EventSchema}]), 
    MongooseModule.forFeature([{ name: Attendant.name, schema: AttendeeSchema}]),
    LoggerModule]
})

export class EventsModule{}