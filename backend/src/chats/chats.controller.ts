import { Body, Controller, Get, Post, Query, Req} from "@nestjs/common";
import { ChatsService } from "./chats.service";
import { ChatBodyData, ChatStartQueryParams, EventInfoQueryParams } from "./dto/chats.dto";
import { Request } from "express";

@Controller('chats')
export class ChatsController{
    constructor(private chatService: ChatsService){}
    @Post("/create")
    createChat(@Body() data: ChatBodyData, @Req() req: Request){
        const eventUser = JSON.parse(req.cookies.auth)?.user
        const finalData = {...data, restrictedUsers: data.restrictedUsers.map(user => user.user)}
        return this.chatService.createChat(finalData, eventUser)
    }

    @Get("/data")
    getChats(@Query() query: EventInfoQueryParams, @Req() req: Request){
        const eventUser = JSON.parse(req.cookies.auth)?.user
        return this.chatService.getChats(query, eventUser)
    }

    @Post("/start")
    startChat(@Query() query: ChatStartQueryParams, @Req() req: Request){
        return this.chatService.startChat(query)   
    }
}