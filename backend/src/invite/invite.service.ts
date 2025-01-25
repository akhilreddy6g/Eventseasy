import { Injectable } from "@nestjs/common";
import { EmailBody } from "./dto/invite.dto";
import * as argon from "argon2";
import { InjectModel } from "@nestjs/mongoose";
import { Attendant, AttendeeDocument } from "src/events/eventdata/events.eventdata.schema";
import { Model } from "mongoose";
import { LogInfoService } from "src/auth/logger/logger.service";
const nodemailer = require("nodemailer");
@Injectable()

export class InviteService{
    constructor( @InjectModel(Attendant.name) private attendantModel: Model <AttendeeDocument>, private logService: LogInfoService){}
    async entryCodeGenerator(data: EmailBody){
        try {
            const secret = process.env.ENTRY_CODE_SECRET_KEY
            const combinedKey = data.eventId + data.user
            const finalKey = await argon.hash(combinedKey+secret)
            if(finalKey){
                this.logService.Logger({request: "Guest Invite Service", source: "invite service -> entryCodeGenerator", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Generated the Hashed Entry Code", error: "none"});
                return {success: true, message: finalKey}
            } else {
                this.logService.Logger({request: "Guest Invite Service", source: "invite service -> entryCodeGenerator", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Unable to generate the hashed entry code", error: "none"});
                return {success: false, message: "Unable to generate the hashkey"}
            }
        } catch (error) {
            this.logService.Logger({request: "Guest Invite Service", source: "invite service -> entryCodeGenerator", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Error while generating the hashed entry code", error: error});
            return {success: false, message: error}
        }
    }

    async codeEntry(data: EmailBody){
        const result = await this.entryCodeGenerator(data);
        if(result.success){
            try {
                const entry = await this.attendantModel.updateOne({user:data.user}, {$set: {entryCode:result.message, accType:data.accType, access:data.access, eventId: data.eventId}}, {upsert: true})
                if (entry){
                    this.logService.Logger({request: "Guest Invite Service", source: "invite service -> codeEntry", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Successfully logged the entry code in db", error: "none"});
                    return {success: true, message: result.message}
                } else {
                    this.logService.Logger({request: "Guest Invite Service", source: "invite service -> codeEntryr", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Entry into the db failed/ data already exist", error: "none"});
                    return {success: false, message: "Entry into the db failed/data already exists"}
                }
            } catch (error) {
                this.logService.Logger({request: "Guest Invite Service", source: "invite service -> codeEntryr", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Error while logging the entry code in the db", error: error});
                return {success: false, message: error}
            }
        } 
    }

    emailBody(data: EmailBody, entryCode: string){
        const body = 
        `
        <h1>Hey ${data.username}</h1>
        <hr/>
        ${data.message && "<p> Here's what" + " " + data.hostName + " has to say: <br/> &emsp;" + data.message +"</p>"}
        <ol>
            <li> Signup with the same email on <a href="www.google.com">Eventseasy</a></li>
            <li> Enter the event id: <h3>${data.eventId}</3> </li>
            <li> Enter the entry code: <h3>${entryCode}</h3></li>
            <li> Join the event and keep yourself updated</li>
        </ol>
        <br/>
        <p>Regards, </p>
        <h3>Team Eventseasy. </h3>
        `
        return body
    }

    async sendEmail(data: EmailBody){
        try {
            const response = await this.codeEntry(data);
            if(response.success){
                try {
                    const html = `<h1> Hey ${data.username} </h1>`
                    let transporter = nodemailer.createTransport({
                        host: "smtp.gmail.com",
                        port: 465,
                        secure: true,
                        auth: {
                            user: process.env.MAIL,
                            pass: process.env.MAIL_PASS,
                        },
                    }); 
                    let info = await transporter.sendMail({
                        from: `Eventseasy <${process.env.MAIL}>`,
                        to: `${data.user}`,
                        subject: `You have been Invited to ${data.eventName} by ${data.hostName}`,
                        html: this.emailBody(data, response.message)
                    });
                    this.logService.Logger({request: "Guest Invite Service", source: "invite service -> sendEmail", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Email sent successfully", error: "none"});
                    return {success: true, message: "Email sent successfully"}
                } catch (error) {
                    this.logService.Logger({request: "Guest Invite Service", source: "invite service -> sendEmail", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Error while sending the email", error: error});
                    return {success: false, message: error}
                }
            } else {
                this.logService.Logger({request: "Guest Invite Service", source: "invite service -> sendEmail", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Failed to send the email", error: "none"});
                return {success: false, message: "unable to send the mail"}
            }
        } catch (error) {
            console.log("error in sendEmail", error)
            this.logService.Logger({request: "Guest Invite Service", source: "invite service -> sendEmail", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Error while generating and saving the hashed key in the db, thereby failing to send an email", error: error});
            return {success: false, message: error}
        }
    }
}