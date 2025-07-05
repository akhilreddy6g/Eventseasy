import { Body, Controller, Post } from "@nestjs/common";
import { InviteService } from "./invite.service";
import { EmailBody } from "./dto/invite.dto";

@Controller("invite")

export class InviteController{
    constructor(private iService: InviteService){}

    @Post("/send")
    async sendInvite(@Body() data: EmailBody){
        try {
            const op = await this.iService.sendEmail(data)
            if(op.success){
                return {success: true, response: "Mail sent successfully"}
            } else {
                return {success: false, response: "Unable to send the mail"}
            }
        } catch (error) {
            console.log("error: ", error)
            return {success: false, response: "Error while sending the mail"}
        }
    }
} 