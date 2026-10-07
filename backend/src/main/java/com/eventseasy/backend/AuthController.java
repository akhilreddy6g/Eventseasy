package com.eventseasy.backend;

import jakarta.servlet.http.*;
import org.bson.Document;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import static com.eventseasy.backend.Values.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService auth;
    private final SessionService sessions;
    private final CookieService cookies;
    private final RequestValidation validation;
    public AuthController(AuthService auth, SessionService sessions, CookieService cookies, RequestValidation validation) {
        this.auth = auth; this.sessions = sessions; this.cookies = cookies; this.validation = validation;
    }
    @PostMapping({"/signin", "/signin/"})
    public ResponseEntity<?> signin(@RequestBody Map<String, Object> data, HttpServletResponse response) { return authenticate(data, response, false); }
    @PostMapping({"/signup", "/signup/"})
    public ResponseEntity<?> signup(@RequestBody Map<String, Object> data, HttpServletResponse response) { return authenticate(data, response, true); }
    private ResponseEntity<?> authenticate(Map<String, Object> data, HttpServletResponse response, boolean signup) {
        validation.check("UserData", data);
        try {
            Document result = auth.authenticate(data, signup);
            if (!success(result)) return ResponseEntity.status(401).body(result(false, result.get("response")));
            cookies.set(response, result.getString("accessToken"), result.get("refreshToken"), str(data, "user"));
            Document body = result(true, result.get("response")); body.put("user", data.get("user"));
            if (result.containsKey("username")) body.put("userName", result.get("username"));
            body.put("accessToken", result.get("accessToken"));
            return ResponseEntity.ok(body);
        } catch (Exception e) { return ResponseEntity.internalServerError().body(result(false, signup ? "An error occurred during signup" : "An error occurred during signin")); }
    }
    @PostMapping({"/refresh-access-token", "/refresh-access-token/"})
    public ResponseEntity<?> refresh(HttpServletRequest request, HttpServletResponse response) {
        LogInfoService.Logger("Access Token Regeneration Service", "session service -> refreshAccessToken",
            false, false, "awaiting", "none");
        Map<String, Object> refresh;
        String access, user;
        try {
            // Preserve the existing auth-cookie name and nested refresh cookie payload.
            refresh = cookies.read(request, "auth");
            user = sessions.verify(str(refresh, "rft"), true).getClaim("user").asString();
            access = sessions.token(user, false);
            LogInfoService.Logger("Access Token Regeneration Service", "session service -> refreshAccessToken",
                false, false, "Successfully generated a new access token", "none");
        } catch (Exception e) {
            LogInfoService.Logger("Access Token Regeneration Service", "session service -> refreshAccessToken",
                false, false, "Error generating a new access token", e);
            LogInfoService.Logger("Access Token Regeneration Service", "session service -> refreshAccessToken",
                false, false, "Failed to generate a new access token", "none");
            return ResponseEntity.status(401).body(result(false, "Failed to regenerate access token/ refresh token expired"));
        }
        try {
            cookies.set(response, access, refresh, user);
            return ResponseEntity.ok(doc("success", true, "response", "Successfully regenerated access token", "user", user));
        } catch (Exception e) { return ResponseEntity.internalServerError().body(result(false, "An error occurred")); }
    }
    @DeleteMapping({"/logout", "/logout/"})
    public Document logout(HttpServletResponse response) throws Exception {
        cookies.clear(response); return result(true, "Logout successful");
    }
}
