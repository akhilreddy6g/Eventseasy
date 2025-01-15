import { Injectable } from "@nestjs/common";
import { AuthdtoSigin, AuthdtoSignup} from "./dto";
import { UsersService } from "./users/users.service";

@Injectable({})

export class AuthService {
    constructor(private userService: UsersService){}

    async signin(data: AuthdtoSigin){
        return this.userService.signin(data)
    }

    async signup(data: AuthdtoSignup){
        return this.userService.signup(data)
    }
}