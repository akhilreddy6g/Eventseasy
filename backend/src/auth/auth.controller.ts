import { Body, Controller, Post, Req, Res, HttpStatus, Delete } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthdtoSigin, AuthdtoSignup } from "./dto";
import { Response, Request } from "express";
import { SessionService } from "./session/session.service";

@Controller("auth")
export class AuthController {
  constructor(private readonly sessionService: SessionService, private readonly authService: AuthService){}

  @Post("/signin")
  async signin(@Res() res: Response, @Body() data: AuthdtoSigin) {
    try {
      const response = await this.authService.signin(data);
      if (response.authneticated) {
        res.cookie("auth", JSON.stringify({ rft: response.refreshToken, email: data.email }),{secure: process.env.NODE_ENV === "production",sameSite: "strict",maxAge: 86400000});
        res.setHeader("authorization", response.accessToken)
        return res.status(HttpStatus.OK).json({ Authenticated: true, message: response.message });
      } else {
        return res.status(HttpStatus.UNAUTHORIZED).json({ Authenticated: false, message: response.message });
      }
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ Authenticated: false, message: "An error occurred during signin" });
    }
  }

  @Post("/signup")
  async signup(@Res() res: Response, @Body() data: AuthdtoSignup) {
    try {
      const response = await this.authService.signup(data);
      if (response.authneticated) {
        res.cookie("auth", JSON.stringify({ rft: response.refreshToken, email: data.email }),{secure: process.env.NODE_ENV === "production",sameSite: "strict",maxAge: 86400000});
        res.setHeader("authorization", response.accessToken)
        return res.status(HttpStatus.OK).json({ Authenticated: true, message: response.message });
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
        res.setHeader("authorization", response.accessToken)
        return res.status(HttpStatus.OK).json({Authenticated: true, message: "Successfully regenerated access token"});
      } else {
        return res.status(HttpStatus.UNAUTHORIZED).json({ Authenticated: false, message: "Failed to regenerate access token" });
      }
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ Authenticated: false, message: "An error occurred" });
    }
  }

  @Delete("/logout")
  async logout(@Res() res: Response, @Req() req: Request){
    if (req.cookies.auth){
      res.clearCookie('auth', { secure: process.env.NODE_ENV === "production",sameSite: "strict" });
      res.removeHeader("authorization");
      return res.status(HttpStatus.OK).json({ Authenticated: false, message: "Logout successful" });
    } 
    return res.status(HttpStatus.OK).json({ Authenticated: false, message: "User Logged out already" });
  }
}
