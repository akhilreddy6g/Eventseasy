import { Body, Controller, Delete, Get, Post, Query, Req} from "@nestjs/common";
import { EventService } from "./events.service";
import { GetEventId, GetEventsQueryDto, HostBodyData, JoineeBodyData, ReinviteUser, UserDetails } from "./dto/events.dto";
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

    @Get("/managers")
    eventManagers(@Query() query: GetEventId){
        return this.eService.eventManagers(query);
    }

    @Delete("/attendee")
    deleteUserFromEvent(@Query() query: UserDetails, @Req() req: Request){
        const eventHost = JSON.parse(req.cookies.auth)?.user
        return this.eService.deleteUserFromEvent(query, eventHost);
    }

    @Post("/reinvite")
    reInviteUser(@Body() data: ReinviteUser, @Req() req: Request){
        const eventHost = JSON.parse(req.cookies.auth)?.user
        return this.eService.reInviteUser(data, eventHost)
    }
}