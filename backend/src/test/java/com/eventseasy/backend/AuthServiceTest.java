package com.eventseasy.backend;

import org.junit.jupiter.api.*;
import org.springframework.security.crypto.argon2.Argon2PasswordEncoder;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static com.eventseasy.backend.Values.*;

class AuthServiceTest {
    MongoStore store = mock(MongoStore.class);
    SessionService sessions = mock(SessionService.class);
    AuthService auth = new AuthService(store, sessions);
    @Test void missingUserKeepsOriginalResponse() {
        assertEquals(result(false, "User does not exist"), auth.authenticate(doc("user", "a@example.com", "password", "secret"), false));
    }
    @Test void verifiesExistingArgon2idHash() {
        String hash = new Argon2PasswordEncoder(16, 32, 4, 65536, 3).encode("unchanged password");
        when(store.one(eq("users"), any())).thenReturn(doc("password", hash, "username", "Akhil"));
        when(sessions.token("a@example.com", false)).thenReturn("access");
        when(sessions.token("a@example.com", true)).thenReturn("refresh");
        var result = auth.authenticate(doc("user", "a@example.com", "password", "unchanged password"), false);
        assertTrue(success(result)); assertEquals("Akhil", result.get("username")); assertEquals("access", result.get("accessToken"));
        assertEquals("Invalid password", auth.authenticate(doc("user", "a@example.com", "password", "wrong"), false).get("response"));
    }
    @Test void duplicateSignupDoesNotInsert() {
        when(store.one(eq("users"), any())).thenReturn(doc("user", "a@example.com"));
        assertEquals("User already exists. Use another contact.", auth.authenticate(doc("user", "a@example.com", "password", "secret"), true).get("response"));
        verify(store, never()).insert(anyString(), any());
    }
    @Test void signupStoresArgon2AndRetainsNames() {
        when(sessions.token(anyString(), anyBoolean())).thenReturn("token");
        assertTrue(success(auth.authenticate(doc("user", "a@example.com", "password", "secret", "username", "Akhil"), true)));
        verify(store).insert(eq("users"), argThat(d -> d.getString("password").startsWith("$argon2id$v=19$m=65536,t=3,p=4$") && d.getString("username").equals("Akhil")));
    }
}
