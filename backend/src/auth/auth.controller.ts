import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthdtoSigin, AuthdtoSignup } from "./dto";

@Controller("auth")

export class AuthController{
    constructor(private authService: AuthService){}
    @Post("/signin")
    signin(@Body() data: AuthdtoSigin){
        return this.authService.signin(data)
    }

    @Post("/signup")
    signup(@Body() data: AuthdtoSignup){
        return this.authService.signup(data)
    }
}