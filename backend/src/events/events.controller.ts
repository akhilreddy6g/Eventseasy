import { Body, Controller, Post, Req } from "@nestjs/common";
import { Request } from "express";
import { EventService } from "./events.service";
import { HostBodyData } from "./dto/events.dto";

@Controller("events")

export class CreateEvents{
    constructor(private eService: EventService){}

    @Post("/host")
    async hostEvent(@Req() req: Request, @Body() data: HostBodyData){
        return await this.eService.hostEvent(data);
    }

    @Post("/manage")
    manageEvent(){

    }

    @Post("/attend")
    attendEvent(){

    }
}