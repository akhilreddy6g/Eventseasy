import { Body, Controller, Get, Post, Req} from "@nestjs/common";
import { EventService } from "./events.service";
import { HostBodyData, JoineeBodyData } from "./dto/events.dto";
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
    userData(@Req() req: Request){
        const user = JSON.parse(req.cookies.auth)?.user;
        return this.eService.userData(user);
    }

}