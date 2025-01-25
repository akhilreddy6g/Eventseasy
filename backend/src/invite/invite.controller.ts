import { Body, Controller, Post } from "@nestjs/common";
import { InviteService } from "./invite.service";
import { EmailBody } from "./dto/invite.dto";

@Controller("invite")

export class InviteController{
    constructor(private iService: InviteService){}

    @Post("/guest")
    async sendInvite(@Body() data: EmailBody){
        try {
            const op = await this.iService.sendEmail(data)
            if(op.success){
                return {success: true, message: "Mail sent successfully"}
            } else {
                return {success: false, message: "Unable to send the mail"}
            }
        } catch (error) {
            console.log("error: ", error)
            return {success: false, message: "Error while sending the mail"}
        }
    }
} 