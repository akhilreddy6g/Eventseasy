import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator"
import { Types } from "mongoose";

export class HostBodyData{
    @IsNotEmpty()
    @IsString()
    startDate: string

    @IsNotEmpty()
    @IsString()
    endDate: string

    @IsNotEmpty()
    @IsString()
    startTime: string

    @IsNotEmpty()
    @IsString()
    endTime: string

    @IsNotEmpty()
    @IsString()
    accType: string

    @IsEmail()
    @IsNotEmpty()
    user: string

    @IsString()
    @IsNotEmpty()
    event: string
}

export class JoineeBodyData{
    @IsNotEmpty()
    @IsEmail()
    user: string

    @IsNotEmpty()
    @IsString()
    accType: string

    @IsNotEmpty()
    eventId: Types.ObjectId
}

export class GetEventsQueryDto {
    @IsNotEmpty()
    @IsEmail()
    user: string

    @IsOptional()
    @IsString()
    status?: string;
}

export class GetEventId {
    @IsNotEmpty()
    @IsString()
    eventId: string
}

export class UserDetails {
    @IsNotEmpty()
    @IsEmail()
    user: string

    @IsNotEmpty()
    @IsString()
    eventId: string

    @IsNotEmpty()
    @IsString()
    accType: string
}

export class ReinviteUser {
    @IsNotEmpty()
    @IsEmail()
    user: string
    
    @IsNotEmpty()
    @IsString()
    username: string

    @IsNotEmpty()
    @IsString()
    eventId: string

    @IsNotEmpty()
    @IsString()
    eventName: string

    @IsNotEmpty()
    @IsString()
    message: string

    @IsNotEmpty()
    @IsString()
    accType: string

    @IsNotEmpty()
    @IsBoolean()
    access: boolean

    @IsNotEmpty()
    @IsString()
    hostName: string
}