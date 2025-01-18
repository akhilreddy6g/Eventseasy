import { Module } from "@nestjs/common";
import { eventController } from "./auth.dummy.controller";

@Module({
    controllers: [eventController]
})

export class DummyModule{}