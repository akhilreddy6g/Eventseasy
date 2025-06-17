"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kafka = void 0;
// kafkaClient.ts
var kafkajs_1 = require("kafkajs");
exports.kafka = new kafkajs_1.Kafka({
    clientId: 'my-app',
    brokers: ['localhost:9092'],
});
