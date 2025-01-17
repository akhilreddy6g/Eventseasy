import { Injectable } from "@nestjs/common";
import { AuthdtoSigin, AuthdtoSignup, SigninResponse} from "./dto";
import { UsersService } from "./users/users.service";

@Injectable({})

export class AuthService {
    constructor(private userService: UsersService){}

    async signin(data: AuthdtoSigin) : Promise<SigninResponse>{
        return await this.userService.signin(data)
    }

    async signup(data: AuthdtoSignup){
        return this.userService.signup(data)
    }
}