package com.eventseasy.backend;

import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static com.eventseasy.backend.Values.*;

@WebMvcTest({AuthController.class, EventController.class, ChatController.class, InviteController.class, AwakeController.class})
@Import({SessionService.class, CookieService.class, RequestValidation.class, WebConfig.class, ApiErrors.class})
@TestPropertySource(properties = {"PORT=3000", "MONGO_URI=mongodb://localhost:27017/test", "ACCESS_TOKEN_SECRET=test-access-secret", "REFRESH_TOKEN_SECRET=test-refresh-secret", "CRON_JOB_API_KEY=test-key"})
class HttpContractTest {
    @Autowired MockMvc mvc;
    @Autowired SessionService sessions;
    @MockitoBean AuthService auth;
    @MockitoBean EventService events;
    @MockitoBean ChatService chats;
    @MockitoBean InviteService invites;
    String token() { return sessions.token("a@example.com", false); }
    @Test void protectedRoutesRejectMissingRawToken() throws Exception {
        mvc.perform(get("/api/events/data").param("user", "a@example.com"))
            .andExpect(status().isUnauthorized()).andExpect(content().json("{\"response\":\"token missing/expired\"}"));
        mvc.perform(get("/api/chats/active-subs").header("Authorization", "Bearer " + token())).andExpect(status().isUnauthorized());
    }
    @Test void signInRetainsCookiesHeaderAndBody() throws Exception {
        when(auth.authenticate(any(), eq(false))).thenReturn(doc("success", true, "response", "Signin successful", "username", "Akhil", "accessToken", "access", "refreshToken", "refresh"));
        mvc.perform(post("/api/auth/signin").contentType("application/json").content("{\"user\":\"a@example.com\",\"password\":\"secret\"}"))
            .andExpect(status().isOk()).andExpect(header().string("authorization", "access"))
            .andExpect(cookie().value("accessToken", "%7B%22act%22%3A%22access%22%2C%22user%22%3A%22a%40example.com%22%7D"))
            .andExpect(cookie().maxAge("accessToken", 7200)).andExpect(cookie().httpOnly("accessToken", false))
            .andExpect(cookie().maxAge("refreshToken", 86400)).andExpect(cookie().httpOnly("refreshToken", true))
            .andExpect(content().json("{\"success\":true,\"response\":\"Signin successful\",\"user\":\"a@example.com\",\"userName\":\"Akhil\",\"accessToken\":\"access\"}", true));
    }
    @Test void failedSigninKeeps401AndResponseText() throws Exception {
        when(auth.authenticate(any(), eq(false))).thenReturn(result(false, "Invalid password"));
        mvc.perform(post("/api/auth/signin").contentType("application/json").content("{\"user\":\"a@example.com\",\"password\":\"bad\"}"))
            .andExpect(status().isUnauthorized()).andExpect(jsonPath("$.response").value("Invalid password"));
    }
    @Test void validationRetainsNestEnvelopeAndMessages() throws Exception {
        mvc.perform(post("/api/auth/signup").contentType("application/json").content("{}"))
            .andExpect(status().isBadRequest()).andExpect(content().json("{\"message\":[\"user should not be empty\",\"user must be an email\",\"password should not be empty\",\"password must be a string\"],\"error\":\"Bad Request\",\"statusCode\":400}", true));
        verifyNoInteractions(auth);
    }
    @Test void nonAuthPostKeepsNest201() throws Exception {
        when(events.join(any())).thenReturn(result(true, "Event joined successfully"));
        mvc.perform(post("/api/events/join").header("Authorization", token()).contentType("application/json")
            .content("{\"user\":\"a@example.com\",\"eventId\":\"e\",\"accType\":\"Attend\"}"))
            .andExpect(status().isCreated()).andExpect(jsonPath("$.response").value("Event joined successfully"));
    }
    @Test void chatRequiresOriginalRefreshCookie() throws Exception {
        mvc.perform(get("/api/chats/data").header("Authorization", token()).param("eventId", "e"))
            .andExpect(status().isUnauthorized()).andExpect(jsonPath("$.message").value("Missing auth cookie"));
    }
    @Test void refreshPreservesExistingAuthCookieMismatch() throws Exception {
        mvc.perform(post("/api/auth/refresh-access-token").cookie(new Cookie("refreshToken", "%7B%22rft%22%3A%22anything%22%7D")))
            .andExpect(status().isUnauthorized()).andExpect(jsonPath("$.response").value("Failed to regenerate access token/ refresh token expired"));
    }
    @Test void awakeKeepsApiKeyAndStatus() throws Exception {
        mvc.perform(post("/api/awake")).andExpect(status().isForbidden()).andExpect(jsonPath("$.message").value("Unauthorized"));
        mvc.perform(post("/api/awake/").header("api-key", "test-key")).andExpect(status().isCreated()).andExpect(jsonPath("$.message").value("Server activated successfully"));
    }
    @Test void corsKeepsFrontendOriginAndCredentials() throws Exception {
        mvc.perform(options("/api/events/host").header("Origin", "http://localhost:3001").header("Access-Control-Request-Method", "POST").header("Access-Control-Request-Headers", "content-type,authorization"))
            .andExpect(status().isNoContent()).andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:3001"))
            .andExpect(header().string("Access-Control-Allow-Credentials", "true"));
    }
    @Test void logoutClearsBothCookies() throws Exception {
        mvc.perform(delete("/api/auth/logout")).andExpect(status().isOk()).andExpect(cookie().maxAge("accessToken", 0))
            .andExpect(cookie().maxAge("refreshToken", 0)).andExpect(jsonPath("$.response").value("Logout successful"));
    }
}
