import { Body, Controller, Get, Post, Query, Req} from "@nestjs/common";
import { ChatsService } from "./chats.service";
import { ChatBodyData, ChatQueryData } from "./dto/chats.dto";
import { Request } from "express";

@Controller('chats')
export class ChatsController{
    constructor(private chatService: ChatsService){}
    @Post("/create")
    createChat(@Body() data: ChatBodyData, @Req() req: Request){
        const eventUser = JSON.parse(req.cookies.auth)?.user
        return this.chatService.createChat(data, eventUser)
    }

    @Get("/data")
    getChats(@Query() query: ChatQueryData, @Req() req: Request){
        const eventUser = JSON.parse(req.cookies.auth)?.user
        return this.chatService.getChats(query, eventUser)
    }
}