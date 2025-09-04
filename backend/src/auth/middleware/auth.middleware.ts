import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { LogInfoService } from '../logger/logger.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private logService: LogInfoService){}
  async use(req: Request, res: Response, next: NextFunction) {
    try {
      if (process.env.NODE_ENV === 'production' && req.protocol !== 'http') {
        throw new UnauthorizedException('Requests must be over HTTPS');
      }
      const token = req.headers.authorization;
      if (!token) {
        throw new UnauthorizedException('Token not provided');
      }
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      if (!decoded) {
        res.clearCookie('accessToken', {secure: process.env.NODE_ENV === "production",sameSite: "none"})
        res.clearCookie('refreshToken', { secure: process.env.NODE_ENV === "production",sameSite: "none", httpOnly: true });
        res.removeHeader("authorization");
        throw new UnauthorizedException('Invalid token');
      }
      req.user = decoded;
      next(); 
    } catch (error) {
      this.logService.Logger({request: "Service Request", source: "AuthMiddleware ", timestamp: new Date(), queryParams: false, bodyParams: false, response: "Token Missing in Auth Headers/ Wrong Token", error: error})
      res.status(401).json({response: "token missing/expired"})
    }
  }
}
