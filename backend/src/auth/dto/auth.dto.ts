import { IsEmail, IsNotEmpty, IsOptional, IsString} from "class-validator";

export interface HashPass{
  hash: string
  plain: string
}

export interface Response{
  success: boolean
  response: string
}

export class UserData{
  @IsString()
  @IsOptional()
  username?: string

  @IsEmail()
  @IsNotEmpty()
  user: string

  @IsString()
  @IsNotEmpty()
  password: string
}

export class AccToken{
  @IsNotEmpty()
  @IsNotEmpty()
  accessToken: string
}

export class Tokens{
  accessToken: string
  refreshToken: string
  user?: string
}

export class SigninResponse{
  success: boolean
  response: string
  accessToken: string
  refreshToken: string
  username?: string
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
