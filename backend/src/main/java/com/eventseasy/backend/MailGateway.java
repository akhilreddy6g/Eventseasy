package com.eventseasy.backend;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.env.Environment;
import org.springframework.mail.javamail.*;
import org.springframework.stereotype.Component;
import java.net.URI;
import java.net.http.*;
import java.nio.charset.StandardCharsets;
import java.util.*;
import static com.eventseasy.backend.Values.*;

@Component
public class MailGateway {
    private final Environment env;
    private final ObjectMapper json;
    private final HttpClient http = HttpClient.newHttpClient();
    public MailGateway(Environment env, ObjectMapper json) { this.env = env; this.json = json; }
    public void send(Map<String, Object> data, String subject, String html) throws Exception {
        String mail = env.getRequiredProperty("MAIL");
        if ("production".equals(env.getProperty("NODE_ENV"))) {
            var message = doc("From", doc("Email", mail, "Name", "Eventseasy <" + mail + ">"),
                "To", List.of(doc("Email", data.get("user"), "Name", data.get("hostName"))),
                "Subject", subject, "TextPart", "Welcome to Eventseasy", "HTMLPart", html);
            String auth = env.getRequiredProperty("MJ_APIKEY_PUBLIC") + ":" + env.getRequiredProperty("MJ_APIKEY_PRIVATE");
            var request = HttpRequest.newBuilder(URI.create("https://api.mailjet.com/v3.1/send"))
                .header("Authorization", "Basic " + Base64.getEncoder().encodeToString(auth.getBytes(StandardCharsets.UTF_8)))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json.writeValueAsString(doc("Messages", List.of(message))))).build();
            // Source returns immediately after scheduling Mailjet; delivery is not awaited.
            http.sendAsync(request, HttpResponse.BodyHandlers.ofString())
                .thenAccept(result -> {
                    if (result.statusCode() >= 200 && result.statusCode() < 300) LogInfoService.consoleLog(result.body());
                    else LogInfoService.consoleLog(result.statusCode());
                })
                .exceptionally(error -> { LogInfoService.consoleLog((Object) null); return null; });
        } else {
            JavaMailSenderImpl sender = new JavaMailSenderImpl();
            sender.setHost("smtp.gmail.com"); sender.setPort(465); sender.setUsername(mail);
            sender.setPassword(env.getRequiredProperty("MAIL_PASS"));
            sender.getJavaMailProperties().put("mail.smtp.auth", "true");
            sender.getJavaMailProperties().put("mail.smtp.ssl.enable", "true");
            var message = sender.createMimeMessage();
            var helper = new MimeMessageHelper(message, "UTF-8");
            helper.setFrom(mail, "Eventseasy"); helper.setTo(str(data, "user"));
            helper.setSubject(subject); helper.setText(html, true); sender.send(message);
        }
    }
}
