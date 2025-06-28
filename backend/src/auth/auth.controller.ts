import { Body, Controller, Post, Req, Res, HttpStatus, Delete } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Response, Request } from "express";
import { SessionService } from "./session/session.service";
import { UserData } from "./dto";
import { RedisService } from "src/redis/redis.service";

@Controller("auth")
export class AuthController {
  constructor(private readonly sessionService: SessionService, private readonly authService: AuthService, private readonly redisService: RedisService){}

  @Post("/signin") 
  async signin(@Res() res: Response, @Body() data: UserData) {
    try {
      const response = await this.authService.signin(data);
      if (response.authneticated) {
        res.cookie("accessToken", JSON.stringify({ act: response.accessToken, user: data.user }),{secure: process.env.NODE_ENV === "production",sameSite: "strict", maxAge: 7200000});
        res.cookie("auth", JSON.stringify({ rft: response.refreshToken, user: data.user }), {secure: process.env.NODE_ENV === "production",sameSite: "strict", maxAge: 86400000, httpOnly: true});       
        res.setHeader("authorization", response.accessToken)
        return res.status(HttpStatus.OK).json({user: data.user, userName: response.username, Authenticated: true, message: response.message});
      } else {
        return res.status(HttpStatus.UNAUTHORIZED).json({ Authenticated: false, message: response.message });
      }
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ Authenticated: false, message: "An error occurred during signin" });
    }
  }

  @Post("/signup")
  async signup(@Res() res: Response, @Body() data: UserData) {
    try {
      const response = await this.authService.signup(data);
      if (response.authneticated) {
        res.cookie("accessToken", JSON.stringify({ act: response.accessToken, user: data.user }),{secure: process.env.NODE_ENV === "production",sameSite: "strict", maxAge: 7200000});
        res.cookie("auth", JSON.stringify({ rft: response.refreshToken, user: data.user }), {secure: process.env.NODE_ENV === "production",sameSite: "strict", maxAge: 86400000, httpOnly: true});        
        res.setHeader("Authorization", `Bearer ${response.accessToken}`);
        return res.status(HttpStatus.OK).json({ user:data.user, userName: data.username, Authenticated: true, message: response.message });
      } else {
        return res.status(HttpStatus.UNAUTHORIZED).json({ Authenticated: false, message: response.message });
      }
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ Authenticated: false, message: "An error occurred during signup" });
    }
  }

  @Post("/refresh-access-token")
  async refreshAct(@Res() res: Response, @Req() req: Request) {
    try {
      const response = this.sessionService.refreshAccessToken(req);
      if (response.accessToken && response.refreshToken) {
        res.cookie("accessToken", JSON.stringify({ act: response.accessToken, user: response.user }),{secure: process.env.NODE_ENV === "production",sameSite: "strict", maxAge: 7200000});
        res.setHeader("authorization", response.accessToken)
        res.cookie("auth", JSON.stringify({ rft: response.refreshToken, user: response.user }), {secure: process.env.NODE_ENV === "production",sameSite: "strict", maxAge: 86400000, httpOnly: true});        
        return res.status(HttpStatus.OK).json({user: response.user, Authenticated: true, message: "Successfully regenerated access token"});
      } else {
        return res.status(HttpStatus.UNAUTHORIZED).json({ Authenticated: false, message: "Failed to regenerate access token/ refresh token expired" });
      }
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ Authenticated: false, message: "An error occurred" });
    }
  }

  @Delete("/logout")
  async logout(@Res() res: Response, @Req() req: Request){
    if (req.cookies.auth){
      const user = JSON.parse(req.cookies.auth).user;
      this.redisService.del(user)
      res.clearCookie('auth', { secure: process.env.NODE_ENV === "production",sameSite: "strict", httpOnly: true });
      res.clearCookie('accessToken', {secure: process.env.NODE_ENV === "production",sameSite: "strict"})
      res.removeHeader("authorization");
      return res.status(HttpStatus.OK).json({ Authenticated: false, message: "Logout successful" });
    } 
    return res.status(HttpStatus.OK).json({ Authenticated: false, message: "User Logged out already" });
  }
}