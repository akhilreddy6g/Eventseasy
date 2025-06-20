import { IsNotEmpty, IsString, IsDateString, IsArray, IsBoolean } from 'class-validator';

export class ChatBodyData {
    /** Unique ID of the event */
    @IsNotEmpty()
    @IsString()
    eventId: string;

    /** Name of the chat */
    @IsNotEmpty()
    @IsString()
    chatName: string;

    /** Description of the chat */
    @IsString()
    chatDescription: string;

    /** Type of the chat - can be "past", "present", or "future" */
    @IsNotEmpty()
    @IsString()
    chatType: string;

    /** Date of the chat (ISO format: YYYY-MM-DD) */
    @IsNotEmpty()
    @IsDateString()
    chatDate: string;

    /** Start time of the chat (HH:mm format recommended) */
    @IsNotEmpty()
    @IsString()
    chatStartTime: string;

    /** End time of the chat (HH:mm format recommended) */
    @IsNotEmpty()
    @IsString()
    chatEndTime: string;

    @IsNotEmpty()
    @IsBoolean()
    chatStatus: boolean

    /** Array of restricted users */
    @IsArray()
    restrictedUsers: UserInfo[] | string[];
}

export interface UserInfo {
    user: string;
    userName: string;
    accType: string;
}

export class EventInfoQueryParams {
    @IsNotEmpty()
    @IsString()
    eventId: string
}

export class ChatStartQueryParams {
    @IsNotEmpty()
    @IsString()
    eventId: string

    @IsNotEmpty()
    @IsString()
    chatId: string
}
