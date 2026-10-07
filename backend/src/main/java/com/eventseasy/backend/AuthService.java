package com.eventseasy.backend;

import org.bson.Document;
import org.springframework.security.crypto.argon2.Argon2PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Map;
import static com.eventseasy.backend.Values.*;

@Service
public class AuthService {
    private final MongoStore store;
    private final SessionService sessions;
    // node-argon2 0.41 defaults: Argon2id v19, 64 MiB, 3 iterations, parallelism 4.
    private final Argon2PasswordEncoder passwords = new Argon2PasswordEncoder(16, 32, 4, 65536, 3);
    public AuthService(MongoStore store, SessionService sessions) { this.store = store; this.sessions = sessions; }
    private Document find(String user) {
        try {
            Document found = store.one("users", doc("user", user));
            LogInfoService.Logger("User Search", "users service -> findUser", false, true,
                found != null ? "User exists" : "User does not exist", "none");
            return found;
        } catch (Exception e) {
            LogInfoService.Logger("User Search", "users service -> findUser", false, true,
                "Error searching User", e);
            return null;
        }
    }
    public Document authenticate(Map<String, Object> data, boolean signup) {
        LogInfoService.Logger(signup ? "Signup Request" : "Signin Request",
            signup ? "auth service -> signup" : "auth service -> signin",
            false, true, "awaiting", "none");
        try {
            Document user = find(str(data, "user"));
            if (signup) {
                if (user != null) return result(false, "User already exists. Use another contact.");
                String hash;
                try { hash = passwords.encode(str(data, "password")); }
                catch (Exception e) {
                    LogInfoService.Logger("Hash Password", "users service -> hashPassword", false, true,
                        "Error hashing the password", e);
                    return result(false, "Error hashing the password");
                }
                // Preserve original createAccount's swallowed insertion failure.
                try {
                    Document entry = pick(data, "username", "user");
                    entry.put("password", hash);
                    Document created = store.insert("users", entry);
                    if (created == null) {
                        LogInfoService.Logger("Account Creation", "users service -> createAccount", false, true,
                            "Failed to create an account", "none");
                    }
                } catch (Exception ignored) {
                    LogInfoService.Logger("Account Creation", "users service -> createAccount", false, true,
                        "Error creating the account", ignored);
                }
                // The NestJS createAccount success path does not return the created user,
                // so its following signup log evaluates the user as falsy.
                LogInfoService.Logger("User Signup", "users service -> signup", false, true,
                    "Signup Failed - Unable to create am account", "none");
            } else {
                if (user == null) return result(false, "User does not exist");
                boolean matches;
                try { matches = passwords.matches(str(data, "password"), user.getString("password")); }
                catch (Exception e) {
                    LogInfoService.Logger("Verify Password", "users service -> verifyPassword", false, true,
                        "Error verifying the password", e);
                    matches = false;
                }
                if (!matches) return result(false, "Invalid password");
            }
            try {
                Document answer = result(true, signup ? "Account setup successful" : "Signin successful");
                answer.put("accessToken", sessions.token(str(data, "user"), false));
                answer.put("refreshToken", sessions.token(str(data, "user"), true));
                LogInfoService.Logger("Token Generation Service", "session service -> genToken ", false, true,
                    "Tokens generated", "none");
                LogInfoService.Logger(signup ? "User Signup" : "User Signin",
                    signup ? "users service -> signup" : "users service -> signin", false, true,
                    signup ? "Signup successful" : "Signin successful", "none");
                Map<String, Object> nameSource = signup ? data : user;
                if (nameSource.containsKey("username")) answer.put("username", nameSource.get("username"));
                return answer;
            } catch (Exception e) {
                LogInfoService.Logger("Token Generation Service", "session service -> genToken ", false, true,
                    "Error generating tokens", e);
                LogInfoService.Logger(signup ? "User Signup" : "User Signin",
                    signup ? "users service -> signup" : "users service -> signin", false, true,
                    "Token generation failed", "none");
                return result(false, signup ? "Failed to create account - Token generation failed" : "Token generation failed");
            }
        } catch (Exception e) {
            LogInfoService.Logger(signup ? "User Signup" : "User Signin",
                signup ? "users service -> signup" : "users service -> signin", false, true,
                signup ? "Error during signup" : "Error during signin", e);
            return result(false, signup ? "An error occurred during signup" : "An error occurred during signin");
        }
    }
}
