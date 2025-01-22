import { Injectable} from "@nestjs/common";
import { SigninResponse, UserData} from "./dto";
import { UsersService } from "./users/users.service";
import { LogInfoService } from "./logger/logger.service";

@Injectable({})

export class AuthService {
    constructor(private logService: LogInfoService, private userService: UsersService){}

    async signin(data: UserData) : Promise<SigninResponse>{
        this.logService.Logger({request: "Signin Request", source: "auth service -> signin", timestamp: new Date(), queryParams: false, bodyParams: true, response: "awaiting", error: "none"})
        return await this.userService.signin(data)
    }

    async signup(data: UserData){
        this.logService.Logger({request: "Signup Request", source: "auth service -> signup", timestamp: new Date(), queryParams: false, bodyParams: true, response: "awaiting", error: "none"})
        return this.userService.signup(data)
    }
}