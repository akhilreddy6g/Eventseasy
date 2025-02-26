import { IsBoolean, IsEmail, IsNotEmpty, IsString } from "class-validator";

export class EmailBody{
    @IsNotEmpty()
    @IsString()
    username: string

    @IsNotEmpty()
    @IsEmail()
    user: string

    @IsNotEmpty()
    @IsString()
    hostName: string

    @IsNotEmpty()
    @IsString()
    eventId: string

    @IsNotEmpty()
    @IsString()
    eventName: string

    @IsNotEmpty()
    @IsString()
    accType: string

    @IsNotEmpty()
    @IsBoolean()
    access: boolean

    @IsString()
    message: string

    @IsBoolean()
    flag: boolean
}