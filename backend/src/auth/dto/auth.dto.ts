import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class AuthdtoSigin{
    @IsEmail()
    @IsNotEmpty()
    email: string

    @IsString()
    @IsNotEmpty()
    password: string
}

export class AuthdtoSignup{
    @IsEmail()
    @IsNotEmpty()
    email: string

    @IsString()
    @IsNotEmpty()
    password: string

    @IsString()
    @IsNotEmpty()
    accType: string

    @IsOptional()
    @IsString()
    eventCode?: string
}