import { Module } from "@nestjs/common";
import { InviteService } from "./invite.service";
import { InviteController } from "./invite.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Attendant, AttendeeSchema} from "src/events/eventdata/events.eventdata.schema";
import { LoggerModule } from "src/auth/logger/logger.module";

@Module({
    providers: [InviteService],
    controllers: [InviteController],
    imports: [ MongooseModule.forFeature([{ name: Attendant.name, schema: AttendeeSchema}]),LoggerModule]
})

export class InviteModule{}