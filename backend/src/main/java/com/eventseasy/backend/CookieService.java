package com.eventseasy.backend;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.*;
import org.springframework.core.env.Environment;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.util.*;
import static com.eventseasy.backend.Values.*;

@Component
public class CookieService {
    private final Environment env;
    private final ObjectMapper json;
    public CookieService(Environment env, ObjectMapper json) { this.env = env; this.json = json; }
    public Map<String, Object> read(HttpServletRequest request, String name) throws Exception {
        if (request.getCookies() != null) for (Cookie cookie : request.getCookies()) {
            if (cookie.getName().equals(name)) {
                // Express decodeURIComponent does not treat '+' as a space.
                String value = URLDecoder.decode(cookie.getValue().replace("+", "%2B"), StandardCharsets.UTF_8);
                return json.readValue(value, new com.fasterxml.jackson.core.type.TypeReference<>() {});
            }
        }
        throw new IllegalArgumentException("Missing auth cookie");
    }
    public boolean has(HttpServletRequest request, String name) {
        return request.getCookies() != null && Arrays.stream(request.getCookies()).anyMatch(c -> c.getName().equals(name));
    }
    public String user(HttpServletRequest request) throws Exception { return str(read(request, "refreshToken"), "user"); }
    public void set(HttpServletResponse response, String access, Object refresh, String user) throws Exception {
        write(response, "accessToken", doc("act", access, "user", user), 7200, false, false);
        write(response, "refreshToken", doc("rft", refresh, "user", user), 86400, true, false);
        response.setHeader("authorization", access);
    }
    public void clear(HttpServletResponse response) throws Exception {
        write(response, "accessToken", null, 0, false, true);
        write(response, "refreshToken", null, 0, true, true);
    }
    private void write(HttpServletResponse response, String name, Object value, long seconds, boolean httpOnly, boolean clear) throws Exception {
        String encoded = value == null ? "" : URLEncoder.encode(json.writeValueAsString(value), StandardCharsets.UTF_8)
            .replace("+", "%20").replace("%21", "!").replace("%27", "'").replace("%28", "(").replace("%29", ")").replace("%7E", "~");
        boolean production = "production".equals(env.getProperty("NODE_ENV"));
        var cookie = ResponseCookie.from(name, encoded).path("/").secure(production)
            .httpOnly(httpOnly).sameSite(production ? "None" : "Lax").maxAge(seconds);
        if (!clear && "production".equals(env.getProperty("ENV"))) cookie.domain(".onrender.com");
        response.addHeader("Set-Cookie", cookie.build().toString());
    }
}
