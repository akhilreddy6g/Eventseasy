import { Body, Controller, Get, Post, Query, Req} from "@nestjs/common";
import { EventService } from "./events.service";
import { GetEventId, GetEventsQueryDto, HostBodyData, JoineeBodyData } from "./dto/events.dto";
import { Request } from "express";

@Controller("events")

export class CreateEvents{
    constructor(private eService: EventService){}

    @Post("/host")
    hostEvent(@Body() data: HostBodyData){
        return this.eService.hostEvent(data);
    }

    @Post("/join")
    joinEvent(@Body() data: JoineeBodyData){
        return this.eService.joinEvent(data);
    }

    @Get("/data")
    userData(@Query() query: GetEventsQueryDto){
        return this.eService.userData(query);
    }

    @Get("/guests")
    eventGuests(@Query() query: GetEventId){
        return this.eService.eventGuests(query);
    }

}