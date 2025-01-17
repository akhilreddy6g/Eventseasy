import { Module } from "@nestjs/common";
import { AuthMiddleware } from "./auth.middleware";
import { LoggerModule } from "../logger/logger.module";

@Module({
    providers:[AuthMiddleware],
    imports:[LoggerModule]
})

export class MiddlewareModule{}