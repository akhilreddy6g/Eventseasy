import { Body, Controller, Post, Res } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthdtoSigin, AuthdtoSignup } from "./dto";
import { Response } from "express";

@Controller("auth")

export class AuthController{
    constructor(private authService: AuthService){}
    @Post("/signin")
    async signin(@Res() res: Response,  @Body() data: AuthdtoSigin){
        const response =  await this.authService.signin(data)
        if(response.authneticated){
            res.cookie('_auth', JSON.stringify({ act: response.accessToken, rft: response.refreshToken }), {httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: true, maxAge: 86400000});
            res.status(200).json({ token: response.accessToken, Authenticated: true, message: response.message });
        } else {
            res.status(200).json({token: null, Authenticated: false, message: response.message})
        }
    }

    @Post("/signup")
    signup(@Body() data: AuthdtoSignup){
        return this.authService.signup(data)
    }
}