package com.eventseasy.backend;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/events")
public class EventController {
    private final EventService events;
    private final CookieService cookies;
    private final RequestValidation validation;
    public EventController(EventService events, CookieService cookies, RequestValidation validation) { this.events = events; this.cookies = cookies; this.validation = validation; }
    @PostMapping({"/host", "/host/"}) @ResponseStatus(HttpStatus.CREATED)
    public Object host(@RequestBody Map<String, Object> data) { validation.check("HostBodyData", data); return events.host(data); }
    @PostMapping({"/join", "/join/"}) @ResponseStatus(HttpStatus.CREATED)
    public Object join(@RequestBody Map<String, Object> data) { validation.check("JoineeBodyData", data); return events.join(data); }
    @GetMapping({"/data", "/data/"})
    public Object data(@RequestParam Map<String, Object> query) { validation.check("GetEventsQueryDto", query); return events.userData(query); }
    @GetMapping({"/guests", "/guests/"})
    public Object guests(@RequestParam Map<String, Object> query) { validation.check("GetEventId", query); return events.attendees((String) query.get("eventId"), false); }
    @GetMapping({"/managers", "/managers/"})
    public Object managers(@RequestParam Map<String, Object> query) { validation.check("GetEventId", query); return events.attendees((String) query.get("eventId"), true); }
    @GetMapping({"/users", "/users/"})
    public Object users(@RequestParam Map<String, Object> query) { validation.check("GetEventId", query); return events.users((String) query.get("eventId")); }
    @DeleteMapping({"/attendee", "/attendee/"})
    public Object delete(@RequestParam Map<String, Object> query, HttpServletRequest request) throws Exception {
        validation.check("UserDetails", query); return events.delete(query, cookies.user(request));
    }
    @PostMapping({"/reinvite", "/reinvite/"}) @ResponseStatus(HttpStatus.CREATED)
    public Object reinvite(@RequestBody Map<String, Object> data, HttpServletRequest request) throws Exception {
        validation.check("ReinviteUser", data); return events.reinvite(data, cookies.user(request));
    }
}
