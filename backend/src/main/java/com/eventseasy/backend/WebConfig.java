package com.eventseasy.backend;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.*;
import com.fasterxml.jackson.databind.module.SimpleModule;
import jakarta.servlet.http.*;
import org.bson.types.ObjectId;
import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer;
import org.springframework.context.annotation.*;
import org.springframework.core.env.Environment;
import org.springframework.web.servlet.*;
import org.springframework.web.servlet.config.annotation.*;
import java.io.IOException;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    private final SessionService sessions;
    private final Environment env;
    public WebConfig(SessionService sessions, Environment env) { this.sessions = sessions; this.env = env; }
    @Bean org.springframework.boot.web.servlet.FilterRegistrationBean<org.springframework.web.filter.OncePerRequestFilter> expressCors() {
        org.springframework.web.filter.OncePerRequestFilter filter = new org.springframework.web.filter.OncePerRequestFilter() {
            @Override protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res,
                    jakarta.servlet.FilterChain chain) throws jakarta.servlet.ServletException, IOException {
                String origin = "production".equals(env.getProperty("NODE_ENV")) ? env.getProperty("CLIENT_URL", "*") : "http://localhost:3001";
                res.setHeader("Access-Control-Allow-Origin", origin);
                res.addHeader("Vary", "Origin");
                res.setHeader("Access-Control-Allow-Credentials", "true");
                res.setHeader("Access-Control-Expose-Headers", "Authorization");
                if ("OPTIONS".equals(req.getMethod())) {
                    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
                    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
                    res.setStatus(204); res.setContentLength(0); return;
                }
                chain.doFilter(req, res);
            }
        };
        var registration = new org.springframework.boot.web.servlet.FilterRegistrationBean<>(filter);
        registration.setOrder(org.springframework.core.Ordered.HIGHEST_PRECEDENCE);
        return registration;
    }
    @Override public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new HandlerInterceptor() {
            @Override public boolean preHandle(HttpServletRequest req, HttpServletResponse res, Object handler) throws IOException {
                if ("OPTIONS".equals(req.getMethod())) return true;
                try {
                    // Deliberately mirrors the source condition, including its protocol comparison.
                    if ("production".equals(env.getProperty("NODE_ENV")) && !"http".equals(req.getScheme())) throw new IllegalArgumentException();
                    sessions.verify(req.getHeader("authorization"), false);
                    return true;
                } catch (Exception e) {
                    LogInfoService.Logger("Service Request", "AuthMiddleware ", false, false,
                        "Token Missing in Auth Headers/ Wrong Token", e);
                    res.setStatus(401); res.setContentType("application/json");
                    res.getWriter().write("{\"response\":\"token missing/expired\"}"); return false;
                }
            }
        }).addPathPatterns("/api/events/**", "/api/chats/**", "/api/invite/**");
    }
    @Bean Jackson2ObjectMapperBuilderCustomizer objectIds() {
        return builder -> {
            SimpleModule module = new SimpleModule();
            module.addSerializer(ObjectId.class, new JsonSerializer<ObjectId>() {
                @Override public void serialize(ObjectId id, JsonGenerator out, SerializerProvider provider) throws IOException { out.writeString(id.toHexString()); }
            });
            builder.modulesToInstall(module);
        };
    }
}
