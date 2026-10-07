package com.eventseasy.backend;

import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static com.eventseasy.backend.Values.*;

class InviteServiceTest {
    MongoStore store = mock(MongoStore.class);
    MailGateway mail = mock(MailGateway.class);
    MockEnvironment env = new MockEnvironment();
    InviteService invites = new InviteService(store, mail, env);
    org.bson.Document body() { return doc("user", "a@example.com", "username", "Guest", "eventId", "e", "eventName", "Party", "hostName", "Host", "accType", "Attend", "access", false, "message", "Welcome", "flag", false); }
    @Test void invitationUpsertsOriginalAttendantFields() throws Exception {
        assertEquals(result(true, "Email sent successfully via Nodemailer"), invites.send(body()));
        verify(store).update(eq("attendants"), eq(doc("user", "a@example.com", "userName", "Guest", "accType", "Attend", "eventId", "e")), eq(doc("$set", doc("access", false))), eq(true));
        verify(mail).send(any(), eq("You have been Invited to Party by Host "), contains("<h3>e</3>"));
    }
    @Test void reinviteSkipsDatabaseWrite() {
        var body = body(); body.put("flag", true); invites.send(body);
        verifyNoInteractions(store);
    }
    @Test void databaseFailureDoesNotSendEmail() {
        doThrow(new IllegalStateException()).when(store).update(any(), any(), any(), anyBoolean());
        assertEquals(result(false, "unable to send the mail"), invites.send(body()));
        verifyNoInteractions(mail);
    }
    @Test void templateRetainsOriginalWordsAndWhitespace() {
        assertEquals("\n        <h1>Hey Guest</h1>\n        <hr/>\n        <p> Here's what Host has to say: <br/> &emsp;Welcome</p>\n        <ol>\n            <li> Signup with the same email on <a href=\"www.google.com\">Eventseasy</a></li>\n            <li> Enter the event id: <h3>e</3> </li>\n            <li> Join the event and keep yourself updated</li>\n        </ol>\n        <br/>\n        <p>Regards, </p>\n        <h3>Team Eventseasy. </h3>\n        ", invites.emailBody(body()));
    }
}
