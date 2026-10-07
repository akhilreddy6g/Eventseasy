package com.eventseasy.backend;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.*;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.mock.env.MockEnvironment;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import jakarta.servlet.http.Cookie;
import java.util.*;
import static com.eventseasy.backend.Values.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/** Each original controller route is exercised without live infrastructure. */
class RouteCoverageTest {
    EventService events = mock(EventService.class);
    ChatService chats = mock(ChatService.class);
    InviteService invites = mock(InviteService.class);
    AuthService auth = mock(AuthService.class);
    MockMvc mvc;
    @BeforeEach void setup() throws Exception {
        ObjectMapper json = new ObjectMapper();
        var validation = new RequestValidation(json);
        var env = new MockEnvironment().withProperty("ACCESS_TOKEN_SECRET", "secret").withProperty("REFRESH_TOKEN_SECRET", "refresh").withProperty("CRON_JOB_API_KEY", "key");
        var cookies = new CookieService(env, json);
        mvc = MockMvcBuilders.standaloneSetup(new EventController(events, cookies, validation), new ChatController(chats, cookies, validation),
            new AuthController(auth, new SessionService(env), cookies, validation), new InviteController(invites, validation), new AwakeController(env))
            .setControllerAdvice(new ApiErrors()).setMessageConverters(new MappingJackson2HttpMessageConverter(json)).build();
    }
    Cookie cookie() { return new Cookie("refreshToken", "%7B%22user%22%3A%22a%40example.com%22%7D"); }
    String body() { return "{\"user\":\"a@example.com\",\"username\":\"Guest\",\"password\":\"secret\",\"eventId\":\"e\",\"chatId\":\"c\",\"accType\":\"Attend\",\"hostName\":\"Host\",\"eventName\":\"Party\",\"access\":false,\"message\":\"Hello\",\"flag\":false,\"startDate\":\"2026-10-04\",\"endDate\":\"2026-10-05\",\"startTime\":\"10:00\",\"endTime\":\"11:00\",\"event\":\"Party\",\"chatName\":\"Chat\",\"chatDescription\":\"\",\"chatType\":\"current\",\"chatDate\":\"2026-10-04\",\"chatStartTime\":\"10:00\",\"chatEndTime\":\"11:00\",\"chatStatus\":false,\"restrictedUsers\":[{\"user\":\"restricted@example.com\"}],\"timestamp\":\"2026-10-04T10:00:00Z\"}"; }
    @Test void allEventRoutesDelegateOriginalInputs() throws Exception {
        for (String route : List.of("host", "join", "reinvite")) mvc.perform(post("/api/events/" + route).cookie(cookie()).contentType("application/json").content(body())).andExpect(status().isCreated());
        for (String route : List.of("data", "guests", "managers", "users")) mvc.perform(get("/api/events/" + route).param("eventId", "e").param("user", "a@example.com")).andExpect(status().isOk());
        mvc.perform(delete("/api/events/attendee").cookie(cookie()).param("eventId", "e").param("user", "a@example.com").param("accType", "Attend")).andExpect(status().isOk());
        verify(events).host(any()); verify(events).join(any()); verify(events).reinvite(any(), eq("a@example.com"));
        verify(events).userData(any()); verify(events).attendees("e", false); verify(events).attendees("e", true); verify(events).users("e"); verify(events).delete(any(), eq("a@example.com"));
    }
    @Test void allChatRoutesAndRestrictedUserMapping() throws Exception {
        for (String route : List.of("create", "push-msg")) mvc.perform(post("/api/chats/" + route).cookie(cookie()).contentType("application/json").content(body())).andExpect(status().isCreated());
        for (String route : List.of("start", "new-ws-conn")) mvc.perform(post("/api/chats/" + route).param("eventId", "e").param("chatId", "c")).andExpect(status().isCreated());
        for (String route : List.of("data", "active-subs", "fetch-msgs")) mvc.perform(get("/api/chats/" + route).cookie(cookie()).param("eventId", "e").param("chatId", "c")).andExpect(status().isOk());
        verify(chats).create(argThat(d -> d.get("restrictedUsers").equals(List.of("restricted@example.com"))), eq("a@example.com"));
        verify(chats).push(any()); verify(chats).start("e", "c"); verify(chats).connection("e", "c"); verify(chats).chats("e", "a@example.com"); verify(chats).subscribers(); verify(chats).messages("e", "c");
    }
    @Test void inviteResponseIsControllerSpecific() throws Exception {
        when(invites.send(any())).thenReturn(result(true, "Email sent successfully via Nodemailer"));
        mvc.perform(post("/api/invite/send").contentType("application/json").content(body())).andExpect(status().isCreated()).andExpect(content().json("{\"success\":true,\"response\":\"Mail sent successfully\"}", true));
    }
    @Test void signupAndSigninStay200() throws Exception {
        when(auth.authenticate(any(), anyBoolean())).thenReturn(doc("success", true, "response", "test", "accessToken", "access", "refreshToken", "refresh", "username", "Guest"));
        for (String route : List.of("signin", "signup")) mvc.perform(post("/api/auth/" + route).contentType("application/json").content(body())).andExpect(status().isOk());
        verify(auth).authenticate(any(), eq(false)); verify(auth).authenticate(any(), eq(true));
    }
}
