import { Injectable } from "@nestjs/common";
import { EmailBody } from "./dto/invite.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Attendant, AttendeeDocument } from "src/events/eventdata/events.eventdata.schema";
import { Model } from "mongoose";
import { LogInfoService } from "src/auth/logger/logger.service";
const nodemailer = require("nodemailer");
const mailjet = require('node-mailjet');

const mj = mailjet.apiConnect(
  process.env.MJ_APIKEY_PUBLIC,
  process.env.MJ_APIKEY_PRIVATE
);

@Injectable()

export class InviteService{
    constructor( @InjectModel(Attendant.name) private attendantModel: Model <AttendeeDocument>, private logService: LogInfoService){}

    async attendantEntry(data: EmailBody){
        try {
            const entry = await this.attendantModel.updateOne({user:data.user, userName:data.username, accType:data.accType, eventId: data.eventId}, {$set: { access: data.access }}, {upsert: true})
            this.logService.Logger({request: `Send Invite Service (${data.accType})`, source: "invite service -> codeEntry", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Successfully logged the attendant record in db", error: "none"});
            return {success: true, response: "Successfully logged the attendant record in db"}
        } catch (error) {
            this.logService.Logger({request: `Send Invite Service (${data.accType})`, source: "invite service -> codeEntry", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Error while logging the attendant record in the db", error: error});
            return {success: false, response: error}
        }
    }

    emailBody(data: EmailBody){
        const body = 
        `
        <h1>Hey ${data.username}</h1>
        <hr/>
        ${data.message && "<p> Here's what" + " " + data.hostName + " has to say: <br/> &emsp;" + data.message +"</p>"}
        <ol>
            <li> Signup with the same email on <a href="www.google.com">Eventseasy</a></li>
            <li> Enter the event id: <h3>${data.eventId}</3> </li>
            <li> Join the event ${data.accType==="Attend"? "and keep yourself updated" : ""}</li>
        </ol>
        <br/>
        <p>Regards, </p>
        <h3>Team Eventseasy. </h3>
        `
        return body
    }

    async sendEmail(data: EmailBody){
        try {
            let finalResponse = {success: true, response: "none"}
            if(!data.flag){
                finalResponse = await this.attendantEntry(data);
            }
            if(finalResponse.success){
                try {
                    if(process.env.NODE_ENV === "production"){
                        const request = mj
                        .post("send", {'version': 'v3.1'})
                        .request({
                            "Messages":[
                                {
                                    "From": {
                                        "Email": process.env.MAIL,
                                        "Name": `Eventseasy <${process.env.MAIL}>`
                                    },
                                    "To": [
                                        {
                                            "Email": `${data.user}`,
                                            "Name": `${data.hostName}`
                                        }
                                    ],
                                    "Subject": `You have been Invited to ${data.eventName} by ${data.hostName} ${data.accType==="manager" ? "as a manager" : ""}`,
                                    "TextPart": "Welcome to Eventseasy",
                                    "HTMLPart": this.emailBody(data)
                                }
                            ]
                        })
                        request.then((result) => {
                            console.log(result.body)
                        })
                        .catch((err) => {
                            console.log(err.statusCode)
                        })
                        this.logService.Logger({request: `Send Invite Service (${data.accType})`, source: "invite service -> sendEmail (Mailjet)", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Email sent successfully", error: "none"});
                        return {success: true, response: "Email sent successfully via Mailjet"}
                    } else {
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
                            subject: `You have been Invited to ${data.eventName} by ${data.hostName} ${data.accType==="manager" ? "as a manager" : ""}`,
                            html: this.emailBody(data)
                        });
                        this.logService.Logger({request: `Send Invite Service (${data.accType})`, source: "invite service -> sendEmail (Nodemailer)", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Email sent successfully", error: "none"});
                        return {success: true, response: "Email sent successfully via Nodemailer"}
                    }

                } catch (error) {
                    this.logService.Logger({request: `Send Invite Service (${data.accType})`, source: "invite service -> sendEmail", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Error while sending the email", error: error});
                    return {success: false, response: error}
                }
            } else {
                this.logService.Logger({request: `Send Invite Service (${data.accType})`, source: "invite service -> sendEmail", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Failed to send the email", error: "none"});
                return {success: false, response: "unable to send the mail"}
            }
        } catch (error) {
            this.logService.Logger({request: `Send Invite Service (${data.accType})`, source: "invite service -> sendEmail", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Error while generating and saving the hashed key in the db, thus failing to send an email", error: error});
            return {success: false, response: error}
        }
    }
}