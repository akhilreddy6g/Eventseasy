import { Module } from "@nestjs/common";
import { CreateEvents } from "./events.controller";
import { EventService } from "./events.service";
import { LoggerModule } from "src/auth/logger/logger.module";
import { Attendant, AttendeeSchema, Event, EventSchema, Viewer, ViewerSchema } from "./eventdata/events.eventdata.schema";
import { MongooseModule } from "@nestjs/mongoose";
import { RedisService } from "src/redis/redis.service";
import { RedisModule } from "src/redis/redis.module";
import { InviteModule } from "src/invite/invite.module";
import { InviteService } from "src/invite/invite.service";

@Module({
    controllers: [CreateEvents],
    providers: [EventService, RedisService, InviteService],
    imports: [
        MongooseModule.forFeature([{ name: Event.name, schema: EventSchema}]), 
        MongooseModule.forFeature([{ name: Attendant.name, schema: AttendeeSchema}]),
        MongooseModule.forFeature([{ name: Viewer.name, schema: ViewerSchema}]),
        LoggerModule,
        RedisModule,
        InviteModule
    ]
})

export class EventsModule{}