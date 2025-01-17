import { IsEmail, IsNotEmpty, IsOptional, IsString, IsEnum } from "class-validator";

export enum AccountType {
  HOST = 'host',
  GUEST = 'guest',
  EVENT_MANAGER = 'event manager',
}

export interface HashPass{
  hash: string
  plain: string
}

export interface Response{
  success: boolean
  message: string
}

export class AuthdtoSigin{
  @IsEmail()
  @IsNotEmpty()
  email: string

  @IsString()
  @IsNotEmpty()
  password: string
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

export class UserData{
  @IsEmail()
  @IsNotEmpty()
  email: string

  @IsString()
  @IsNotEmpty()
  password: string

  @IsString()
  @IsNotEmpty()
  accType: string;
}

export class AccToken{
  @IsNotEmpty()
  @IsNotEmpty()
  accessToken: string
}

export class Tokens{
  accessToken: string
  refreshToken: string
}

export class SigninResponse{
  authneticated: boolean
  message: string
  accessToken: string
  refreshToken: string
}

export class Log{
  request: string
  source: string
  timestamp: Date
  queryParams: boolean
  bodyParams: boolean
  response: string
  error: string
}
