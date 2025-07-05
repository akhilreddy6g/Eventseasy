import { Body, Controller, Get, Post, Query, Req} from "@nestjs/common";
import { ChatsService } from "./chats.service";
import { ChatBodyData, EventIdQueryParams, EventIdChatIdQueryParams, MessageBody} from "./dto/chats.dto";
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
    getChats(@Query() query: EventIdQueryParams, @Req() req: Request){
        const eventUser = JSON.parse(req.cookies.auth)?.user
        return this.chatService.getChats(query, eventUser)
    }

    @Post("/start")
    startChat(@Query() query: EventIdChatIdQueryParams, @Req() req: Request){
        return this.chatService.startChat(query)   
    }

    @Post("/new-ws-conn")
    async getNewWsConn(@Query() data: EventIdChatIdQueryParams){
        return await this.chatService.getNewWsConn(data)
    }

    @Get('/active-subs')
    async getAllSubscribers(){
        return await this.chatService.getAllSubscribers()
    }

    @Post("/push-msg")
    async pushMsgToQueue(@Body() data: MessageBody){
        const response = await this.chatService.pushMsgToQueue(data)
        return response
    }
    
    @Get('/fetch-msgs')
    async fetchMsgs(@Query() query: EventIdChatIdQueryParams){
        return await this.chatService.fetchMsgs(query)
    }
}