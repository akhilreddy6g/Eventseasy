import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator"

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

    @IsString()
    @IsNotEmpty()
    user: string

    @IsString()
    @IsNotEmpty()
    event: string
}

export class JoineeBodyData{
    @IsNotEmpty()
    @IsString()
    user: string

    @IsNotEmpty()
    @IsString()
    entryCode: string

    @IsNotEmpty()
    @IsString()
    accType: string

    @IsString()
    @IsNotEmpty()
    event: string

    @IsString()
    @IsNotEmpty()
    eventId: string
}