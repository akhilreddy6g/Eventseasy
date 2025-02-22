import { IsDate, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator"
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