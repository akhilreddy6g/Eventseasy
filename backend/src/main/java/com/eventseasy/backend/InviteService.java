package com.eventseasy.backend;

import org.bson.Document;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;
import java.util.Map;
import static com.eventseasy.backend.Values.*;

@Service
public class InviteService {
    private final MongoStore store;
    private final MailGateway mail;
    private final Environment env;
    public InviteService(MongoStore store, MailGateway mail, Environment env) { this.store = store; this.mail = mail; this.env = env; }
    public String emailBody(Map<String, Object> data) {
        String message = str(data, "message");
        String paragraph = message == null ? "undefined" : message.isEmpty() ? "" : "<p> Here's what " + data.get("hostName") + " has to say: <br/> &emsp;" + message +"</p>";
        return "\n        <h1>Hey " + data.get("username") + "</h1>\n        <hr/>\n        " + paragraph +
            "\n        <ol>\n            <li> Signup with the same email on <a href=\"www.google.com\">Eventseasy</a></li>\n            <li> Enter the event id: <h3>" + data.get("eventId") +
            "</3> </li>\n            <li> Join the event " + ("Attend".equals(data.get("accType")) ? "and keep yourself updated" : "") +
            "</li>\n        </ol>\n        <br/>\n        <p>Regards, </p>\n        <h3>Team Eventseasy. </h3>\n        ";
    }
    public Document send(Map<String, Object> data) {
        try {
            if (!Boolean.TRUE.equals(data.get("flag"))) {
                try {
                    Document filter = doc("user", data.get("user"), "userName", data.get("username"), "accType", data.get("accType"), "eventId", data.get("eventId"));
                    store.update("attendants", filter, doc("$set", doc("access", data.get("access"))), true);
                    LogInfoService.Logger("Send Invite Service (" + data.get("accType") + ")", "invite service -> codeEntry",
                        false, true, "Successfully logged the attendant record in db", "none");
                } catch (Exception e) {
                    LogInfoService.Logger("Send Invite Service (" + data.get("accType") + ")", "invite service -> codeEntry",
                        false, true, "Error while logging the attendant record in the db", e);
                    LogInfoService.Logger("Send Invite Service (" + data.get("accType") + ")", "invite service -> sendEmail",
                        false, true, "Failed to send the email", "none");
                    return result(false, "unable to send the mail");
                }
            }
            try {
                String subject = "You have been Invited to " + data.get("eventName") + " by " + data.get("hostName") + " " + ("manager".equals(data.get("accType")) ? "as a manager" : "");
                mail.send(data, subject, emailBody(data));
                if ("production".equals(env.getProperty("NODE_ENV"))) {
                    LogInfoService.Logger("Send Invite Service (" + data.get("accType") + ")", "invite service -> sendEmail (Mailjet)",
                        false, true, "Email sent successfully", "none");
                    return result(true, "Email sent successfully via Mailjet");
                }
                LogInfoService.Logger("Send Invite Service (" + data.get("accType") + ")", "invite service -> sendEmail (Nodemailer)",
                    false, true, "Email sent successfully", "none");
                return result(true, "Email sent successfully via Nodemailer");
            } catch (Exception e) {
                LogInfoService.Logger("Send Invite Service (" + data.get("accType") + ")", "invite service -> sendEmail",
                    false, true, "Error while sending the email", e);
                return result(false, error());
            }
        } catch (Exception e) {
            LogInfoService.Logger("Send Invite Service (" + data.get("accType") + ")", "invite service -> sendEmail",
                false, true, "Error while generating and saving the hashed key in the db, thus failing to send an email", e);
            return result(false, error());
        }
    }
}