package com.eventseasy.backend;

import java.util.*;
import org.bson.Document;

final class Values {
    private Values() {}
    static Document doc(Object... pairs) {
        Document result = new Document();
        for (int i = 0; i < pairs.length; i += 2) result.put((String) pairs[i], pairs[i + 1]);
        return result;
    }
    static Document result(boolean success, Object response) { return doc("success", success, "response", response); }
    static String str(Map<String, ?> value, String key) { return (String) value.get(key); }
    static Document pick(Map<String, ?> value, String... keys) {
        Document result = new Document();
        for (String key : keys) if (value.containsKey(key)) result.put(key, value.get(key));
        return result;
    }
    static boolean success(Map<String, ?> value) { return Boolean.TRUE.equals(value.get("success")); }
    // JSON.stringify(Error) returns an empty object for ordinary JavaScript errors.
    static Document error() { return new Document(); }
}
