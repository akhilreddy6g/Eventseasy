import { Body, Controller, Get, Post } from "@nestjs/common";
import { MessageBody, NewWsConnBody } from "./dto/message.dto";
import { MessageService } from "./message.service";

@Controller('message')

export class MessageController {
    constructor(private msgService: MessageService){}
    @Post("/new-ws-conn")
    async establishNewWSConnection(@Body() data: NewWsConnBody){

    }

    @Get('active-subs')
    async getAllSubscribers(){
        return await this.msgService.getAllSubscribers()
    }

    @Post("/push-msg")
    async pushMsgToQueue(@Body() data: MessageBody){
        const response = await this.msgService.pushMsgToQueue(data)
        return response
    }
}