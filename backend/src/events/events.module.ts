import { Module } from "@nestjs/common";
import { CreateEvents } from "./events.controller";
import { EventService } from "./events.service";
import { LoggerModule } from "src/auth/logger/logger.module";
import { Event, EventSchema } from "./eventdata/events.eventdata.schema";
import { MongooseModule } from "@nestjs/mongoose";

@Module({
    controllers: [CreateEvents],
    providers: [EventService],
    imports: [MongooseModule.forFeature([{ name: Event.name, schema: EventSchema}]), 
    LoggerModule]
})

export class EventsModule{}