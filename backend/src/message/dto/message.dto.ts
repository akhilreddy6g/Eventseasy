import { IsNotEmpty, IsString } from "class-validator";

export class MessageBody {
    @IsNotEmpty()
    @IsString()
    eventId: string;

    @IsNotEmpty()
    @IsString()
    chatId: string;

    @IsNotEmpty()
    @IsString()
    user: string;

    @IsNotEmpty()
    @IsString()
    username: string;

    @IsNotEmpty()
    @IsString()
    message: string;

    @IsNotEmpty()
    @IsString()
    timestamp: string;
}

export class NewWsConnBody {
    @IsNotEmpty()
    @IsString()
    eventId: string;

    @IsNotEmpty()
    @IsString()
    chatId: string;
}