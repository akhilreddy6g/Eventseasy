package com.eventseasy.backend;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

import java.net.URI;

/**
 * Keeps Cloudinary credentials server-side and accepts the standard CLOUDINARY_URL
 * format as well as individual environment variables.
 */
public record CloudinarySettings(String cloudName, String apiKey, String apiSecret) {
    public boolean configured() {
        return present(cloudName) && present(apiKey) && present(apiSecret);
    }

    private static boolean present(String value) {
        return value != null && !value.isBlank();
    }

    static CloudinarySettings from(Environment env) {
        String cloudName = env.getProperty("CLOUDINARY_CLOUD_NAME", "");
        String apiKey = env.getProperty("CLOUDINARY_API_KEY", "");
        String apiSecret = env.getProperty("CLOUDINARY_API_SECRET", "");
        String cloudinaryUrl = env.getProperty("CLOUDINARY_URL", "");

        if (!present(cloudinaryUrl)) return new CloudinarySettings(cloudName, apiKey, apiSecret);

        try {
            URI uri = URI.create(cloudinaryUrl);
            String[] credentials = uri.getUserInfo() == null ? new String[0] : uri.getUserInfo().split(":", 2);
            return new CloudinarySettings(
                present(cloudName) ? cloudName : nullToEmpty(uri.getHost()),
                present(apiKey) ? apiKey : credentials.length > 0 ? credentials[0] : "",
                present(apiSecret) ? apiSecret : credentials.length > 1 ? credentials[1] : ""
            );
        } catch (IllegalArgumentException ignored) {
            return new CloudinarySettings(cloudName, apiKey, apiSecret);
        }
    }

    private static String nullToEmpty(String value) {
        return value == null ? "" : value;
    }
}

@Configuration
class CloudinaryConfiguration {
    @Bean
    CloudinarySettings cloudinarySettings(Environment env) {
        return CloudinarySettings.from(env);
    }

    @Bean
    Cloudinary cloudinary(CloudinarySettings settings) {
        return new Cloudinary(ObjectUtils.asMap(
            "cloud_name", settings.cloudName(),
            "api_key", settings.apiKey(),
            "api_secret", settings.apiSecret(),
            "secure", true
        ));
    }
}
