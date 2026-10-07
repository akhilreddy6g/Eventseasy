package com.eventseasy.backend;

import java.nio.charset.StandardCharsets;
import java.util.regex.Pattern;

/** Default validator.js email/ISO rules used by the original class-validator DTOs. */
final class LegacyValidators {
    private LegacyValidators() {}
    private static final Pattern USER = Pattern.compile("^[a-z\\d!#$%&'*+\\-/=?^_`{|}~\\u00A1-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF]+$", Pattern.CASE_INSENSITIVE);
    private static final Pattern QUOTED = Pattern.compile("^([\\s\\x01-\\x08\\x0b\\x0c\\x0e-\\x1f\\x7f\\x21\\x23-\\x5b\\x5d-\\x7e\\u00A0-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF]|(\\\\[\\x01-\\x09\\x0b\\x0c\\x0d-\\x7f\\u00A0-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF]))*$", Pattern.CASE_INSENSITIVE);
    private static final Pattern TLD = Pattern.compile("^([a-z\\u00A1-\\u00A8\\u00AA-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF]{2,}|xn[a-z0-9-]{2,})$", Pattern.CASE_INSENSITIVE);
    private static final Pattern LABEL = Pattern.compile("^[a-z_\\u00a1-\\uffff0-9-]+$", Pattern.CASE_INSENSITIVE);
    static boolean email(String text) {
        if (text.length() > 254) return false;
        int at = text.lastIndexOf('@');
        if (at < 0) return false;
        String user = text.substring(0, at), domain = text.substring(at + 1);
        if (user.getBytes(StandardCharsets.UTF_8).length > 64 || domain.getBytes(StandardCharsets.UTF_8).length > 254) return false;
        String[] labels = domain.split("\\.", -1);
        if (labels.length < 2 || !TLD.matcher(labels[labels.length - 1]).matches()) return false;
        for (String label : labels) {
            if (label.length() > 63 || !LABEL.matcher(label).matches() || label.startsWith("-") || label.endsWith("-") || label.contains("_")) return false;
            for (char c : label.toCharArray()) if (c >= '\uff01' && c <= '\uff5e') return false;
        }
        if (user.startsWith("\"")) return QUOTED.matcher(user.length() < 2 ? "" : user.substring(1, user.length() - 1)).matches();
        for (String part : user.split("\\.", -1)) if (!USER.matcher(part).matches()) return false;
        return true;
    }
    // Java rejects unmatched backreferences; JavaScript treats them as empty.
    // The second expression covers the original optional minute group being absent.
    static boolean iso8601(String text) {
        return ISO.matcher(text).matches() || ISO_NO_MINUTES.matcher(text).matches();
    }
    private static final Pattern ISO = Pattern.compile("^([\\+-]?\\d{4}(?!\\d{2}\\b))((-?)((0[1-9]|1[0-2])(\\3([12]\\d|0[1-9]|3[01]))?|W([0-4]\\d|5[0-3])(-?[1-7])?|(00[1-9]|0[1-9]\\d|[12]\\d{2}|3([0-5]\\d|6[1-6])))([T\\s]((([01]\\d|2[0-3])((:?)[0-5]\\d)?|24:?00)([\\.,]\\d+(?!:))?)?(\\17[0-5]\\d([\\.,]\\d+)?)?([zZ]|([\\+-])([01]\\d|2[0-3]):?([0-5]\\d)?)?)?)?$");
    private static final Pattern ISO_NO_MINUTES = Pattern.compile("^([\\+-]?\\d{4}(?!\\d{2}\\b))((-?)((0[1-9]|1[0-2])(\\3([12]\\d|0[1-9]|3[01]))?|W([0-4]\\d|5[0-3])(-?[1-7])?|(00[1-9]|0[1-9]\\d|[12]\\d{2}|3([0-5]\\d|6[1-6])))([T\\s]((([01]\\d|2[0-3])|24:?00)([\\.,]\\d+(?!:))?)?([0-5]\\d([\\.,]\\d+)?)?([zZ]|([\\+-])([01]\\d|2[0-3]):?([0-5]\\d)?)?)?)?$");
}
