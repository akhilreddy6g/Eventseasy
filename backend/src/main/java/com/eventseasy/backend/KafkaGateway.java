package com.eventseasy.backend;

import jakarta.annotation.PreDestroy;
import org.apache.kafka.clients.admin.*;
import org.apache.kafka.clients.producer.*;
import org.apache.kafka.common.errors.TopicExistsException;
import org.apache.kafka.common.serialization.StringSerializer;
import org.bson.Document;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.TimeUnit;
import static com.eventseasy.backend.Values.*;

@Component
public class KafkaGateway {
    private final Environment env;
    private KafkaProducer<String, String> producer;
    public KafkaGateway(Environment env) { this.env = env; }
    Map<String, Object> properties() {
        Map<String, Object> config = new HashMap<>();
        config.put("bootstrap.servers", env.getRequiredProperty("KAFKA_CLIENT_URL"));
        config.put("client.id", env.getRequiredProperty("KAFKA_CLIENT_ID"));
        if ("production".equals(env.getProperty("NODE_ENV"))) {
            config.put("security.protocol", "SSL");
            config.put("ssl.truststore.type", "PEM");
            config.put("ssl.truststore.certificates", env.getRequiredProperty("KAFKA_CLIENT_CA_CERT"));
            config.put("ssl.keystore.type", "PEM");
            config.put("ssl.keystore.certificate.chain", env.getRequiredProperty("KAFKA_ACCESS_CERT"));
            config.put("ssl.keystore.key", env.getRequiredProperty("KAFKA_ACCESS_KEY"));
        }
        return config;
    }
    @EventListener(ApplicationReadyEvent.class)
    public void createTopic() {
        try (Admin admin = Admin.create(properties())) {
            var topic = new NewTopic(env.getRequiredProperty("KAFKA_TOPIC_NAME"), partitions(), (short) 1);
            admin.createTopics(List.of(topic)).all().get(30, TimeUnit.SECONDS);
            LogInfoService.Logger("Kafka Topic Creation Service", "kafka service -> createKafkaTopic", false, false,
                "Topic created successfully with " + env.getRequiredProperty("KAFKA_TOPIC_PARTITIONS") + " partitions", "none");
        } catch (Exception e) {
            if (e.getCause() instanceof TopicExistsException) {
                LogInfoService.Logger("Kafka Topic Creation Service", "kafka service -> createKafkaTopic", false, false,
                    "Topic already exists. No changes made", "none");
            } else {
                String details = new Document()
                    .append("name", e.getClass().getSimpleName())
                    .append("message", e.getMessage())
                    .append("type", e.getCause() == null ? null : e.getCause().getClass().getSimpleName())
                    .append("code", null)
                    .append("retriable", null)
                    .append("innerErrors", List.of())
                    .toJson();
                LogInfoService.Logger("Kafka Topic Creation Service", "kafka service -> createKafkaTopic", false, false,
                    "Error creating topic", details);
            }
        }
    }
    int partitions() { return Integer.parseInt(env.getRequiredProperty("KAFKA_TOPIC_PARTITIONS")); }
    public static int computePartition(String eventId, String chatId, int partitions) {
        try {
            byte[] hash = MessageDigest.getInstance("SHA-256").digest((eventId + "-" + chatId).getBytes(StandardCharsets.UTF_8));
            long first = ((hash[0] & 255L) << 24) | ((hash[1] & 255L) << 16) | ((hash[2] & 255L) << 8) | (hash[3] & 255L);
            return (int) (first % partitions);
        } catch (java.security.NoSuchAlgorithmException e) { throw new IllegalStateException(e); }
    }
    public void send(String eventId, String chatId, String json) throws Exception {
        KafkaProducer<String, String> active;
        synchronized (this) {
            if (producer == null) {
                var props = properties();
                props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
                props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
                props.put(ProducerConfig.ACKS_CONFIG, "all");
                producer = new KafkaProducer<>(props);
            }
            active = producer;
        }
        active.send(new ProducerRecord<>(env.getRequiredProperty("KAFKA_TOPIC_NAME"),
            computePartition(eventId, chatId, partitions()), null, json)).get();
    }
    public List<Document> subscribers() throws Exception {
        try (Admin admin = Admin.create(properties())) {
            var groups = admin.describeConsumerGroups(List.of(env.getRequiredProperty("KAFKA_CONSUMER_GROUP_ID"))).all().get(30, TimeUnit.SECONDS);
            List<Document> result = new ArrayList<>();
            for (var group : groups.values()) for (var member : group.members()) {
                // Nest's decoder reads the first topic from the assignment buffer.
                var assigned = member.assignment().topicPartitions().stream()
                    .sorted(Comparator.comparing(org.apache.kafka.common.TopicPartition::topic).thenComparingInt(org.apache.kafka.common.TopicPartition::partition)).toList();
                String firstTopic = assigned.isEmpty() ? null : assigned.get(0).topic();
                for (var partition : assigned) if (partition.topic().equals(firstTopic))
                    result.add(doc("clientId", member.clientId(), "partition", partition.partition()));
            }
            return result;
        }
    }
    @PreDestroy public synchronized void close() { if (producer != null) producer.close(Duration.ofSeconds(10)); }
}
