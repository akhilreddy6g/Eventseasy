import { Injectable } from "@nestjs/common";
import { AuthdtoSigin, AuthdtoSignup } from "./dto";
import * as argon from "argon2";
import { UsersService } from "./users/users.service";

@Injectable({})

export class AuthService {
    constructor(private userService: UsersService){}

    async signin(data: AuthdtoSigin){
        const emailExists = await this.userService.findEmail(data);
        if(emailExists){
            const checkEmail = await this.userService.verifyEmail(data);
            if (checkEmail){
                return checkEmail
            } else {
                return "Invalid Password"
            }
        }
        else {
            return "Email does not exist"
        }
    }

    async signup(data: AuthdtoSignup){
        const emailExists = await this.userService.findEmail(data);
        if(emailExists){
            return "Email exists. Use another email"
        } else {
            return this.userService.create(data)
        }
    }
}