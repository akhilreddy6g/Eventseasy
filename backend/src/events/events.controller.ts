import { Body, Controller, Post, Req } from "@nestjs/common";
import { Request } from "express";
import { EventService } from "./events.service";
import { HostBodyData, JoineeBodyData } from "./dto/events.dto";

@Controller("events")

export class CreateEvents{
    constructor(private eService: EventService){}

    @Post("/host")
    hostEvent(@Req() req: Request, @Body() data: HostBodyData){
        return this.eService.hostEvent(data);
    }

    @Post("/join")
    joinEvent(@Req() req: Request, @Body() data: JoineeBodyData){
        return this.eService.joinEvent(data);
    }
}