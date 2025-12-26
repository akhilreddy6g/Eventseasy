import { Body, Controller, Post, Req, Res, HttpStatus, Delete } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Response, Request, response } from "express";
import { SessionService } from "./session/session.service";
import { UserData } from "./dto";
import { RedisService } from "src/redis/redis.service";

@Controller("auth")
export class AuthController {
  constructor(private readonly sessionService: SessionService, private readonly authService: AuthService, private readonly redisService: RedisService){}

  @Post("/signin") 
  async signin(@Res() res: Response, @Body() data: UserData) {
    try {
      const result = await this.authService.signin(data);
      if (result.success) {
        res.cookie("accessToken", JSON.stringify({ act: result.accessToken, user: data.user }),{secure: process.env.NODE_ENV === "production",sameSite: "none", path: '/', maxAge: 7200000, domain: process.env.ENV === 'production' && '.onrender.com'});
        res.cookie("refreshToken", JSON.stringify({ rft: result.refreshToken, user: data.user }), {secure: process.env.NODE_ENV === "production",sameSite: "none", path: '/', maxAge: 86400000, httpOnly: true, domain: process.env.ENV === 'production' && '.onrender.com'});       
        res.setHeader("authorization", result.accessToken)
        return res.status(HttpStatus.OK).json({success: true, response: result.response, user: data.user, userName: result.username, accessToken: result.accessToken});
      } else {
        return res.status(HttpStatus.UNAUTHORIZED).json({ success: false, response: result.response });
      }
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, response: "An error occurred during signin" });
    }
  }

  @Post("/signup")
  async signup(@Res() res: Response, @Body() data: UserData) {
    try {
      const result = await this.authService.signup(data);
      if (result.success) {
        res.cookie("accessToken", JSON.stringify({ act: result.accessToken, user: data.user }),{secure: process.env.NODE_ENV === "production",sameSite: "none", path: '/', maxAge: 7200000, domain: process.env.ENV === 'production' && '.onrender.com'});
        res.cookie("refreshToken", JSON.stringify({ rft: result.refreshToken, user: data.user }), {secure: process.env.NODE_ENV === "production",sameSite: "none", path: '/', maxAge: 86400000, httpOnly: true, domain: process.env.ENV === 'production' && '.onrender.com'});        
        res.setHeader("authorization", result.accessToken);
        return res.status(HttpStatus.OK).json({ success: true, response: result.response, user:data.user, userName: data.username, accessToken: result.accessToken });
      } else {
        return res.status(HttpStatus.UNAUTHORIZED).json({ success: false, response: result.response});
      }
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, response: "An error occurred during signup" });
    }
  }

  @Post("/refresh-access-token")
  async refreshAct(@Res() res: Response, @Req() req: Request) {
    try {
      const result = this.sessionService.refreshAccessToken(req);
      if (result.accessToken && result.refreshToken) {
        res.cookie("accessToken", JSON.stringify({ act: result.accessToken, user: result.user }),{secure: process.env.NODE_ENV === "production",sameSite: "none", path: '/', maxAge: 7200000, domain: process.env.ENV === 'production' && '.onrender.com'});
        res.cookie("refreshToken", JSON.stringify({ rft: result.refreshToken, user: result.user }), {secure: process.env.NODE_ENV === "production",sameSite: "none", path: '/', maxAge: 86400000, httpOnly: true, domain: process.env.ENV === 'production' && '.onrender.com'});
        res.setHeader("authorization", result.accessToken)        
        return res.status(HttpStatus.OK).json({success: true, response: "Successfully regenerated access token",user: result.user});
      } else {
        return res.status(HttpStatus.UNAUTHORIZED).json({ success: false, response: "Failed to regenerate access token/ refresh token expired" });
      }
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, response: "An error occurred" });
    }
  }

  @Delete("/logout")
  async logout(@Res() res: Response, @Req() req: Request){
    // if (req.cookies.refreshToken){
      // const user = JSON.parse(req.cookies.auth).user;
      // this.redisService.del(user)
      res.clearCookie('accessToken', {secure: process.env.NODE_ENV === "production", sameSite: "none"})
      res.clearCookie('refreshToken', { secure: process.env.NODE_ENV === "production", sameSite: "none", httpOnly: true });
      res.removeHeader("authorization");
      return res.status(HttpStatus.OK).json({ success: true, response: "Logout successful" });
    // } 
    // return res.status(HttpStatus.OK).json({ success: false, response: "User Logged out already" });
  }
}