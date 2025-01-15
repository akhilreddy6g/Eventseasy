import { IsEmail, IsNotEmpty, IsOptional, IsString, IsEnum } from "class-validator";

export class AuthdtoSigin{
    @IsEmail()
    @IsNotEmpty()
    email: string

    @IsString()
    @IsNotEmpty()
    password: string
}

export enum AccountType {
  HOST = 'host',
  GUEST = 'guest',
  EVENT_MANAGER = 'event manager',
}

export class AuthdtoSignup {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsEnum(AccountType)
  @IsNotEmpty()
  accType: AccountType;

  @IsOptional()
  @IsString()
  eventCode?: string;
}


export interface HashPass{
    hash: string
    plain: string
}

export interface Response{
    success: boolean
    message: string
}