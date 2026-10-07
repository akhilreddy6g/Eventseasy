package com.eventseasy.backend;

import com.mongodb.client.model.UpdateOptions;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Repository;
import java.util.*;

@Repository
public class MongoStore {
    private final MongoTemplate mongo;
    public MongoStore(MongoTemplate mongo) { this.mongo = mongo; }
    public Document one(String collection, Document filter) { return mongo.getCollection(collection).find(filter).first(); }
    public List<Document> find(String collection, Document filter) { return mongo.getCollection(collection).find(filter).into(new ArrayList<>()); }
    public List<Document> aggregate(String collection, List<Document> pipeline) { return mongo.getCollection(collection).aggregate(pipeline).into(new ArrayList<>()); }
    public Document insert(String collection, Document value) {
        if (!value.containsKey("_id")) value.put("_id", new ObjectId());
        mongo.getCollection(collection).insertOne(value);
        return value;
    }
    public void update(String collection, Document filter, Document update, boolean upsert) {
        mongo.getCollection(collection).updateOne(filter, update, new UpdateOptions().upsert(upsert));
    }
    public long delete(String collection, Document filter) { return mongo.getCollection(collection).deleteOne(filter).getDeletedCount(); }
}
