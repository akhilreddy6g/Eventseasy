package com.eventseasy.backend;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import static com.eventseasy.backend.Values.*;

@RestController
@RequestMapping("/api/invite")
public class InviteController {
    private final InviteService invites;
    private final RequestValidation validation;
    public InviteController(InviteService invites, RequestValidation validation) { this.invites = invites; this.validation = validation; }
    @PostMapping({"/send", "/send/"}) @ResponseStatus(HttpStatus.CREATED)
    public Object send(@RequestBody Map<String, Object> data) {
        validation.check("EmailBody", data);
        try { return success(invites.send(data)) ? result(true, "Mail sent successfully") : result(false, "Unable to send the mail"); }
        catch (Exception e) {
            LogInfoService.consoleLog("error: ", e);
            return result(false, "Error while sending the mail");
        }
    }
}
