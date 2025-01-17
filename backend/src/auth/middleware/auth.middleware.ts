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
      const token = req.headers['authorization']?.split(' ')[1]; 
      if (!token) {
        throw new UnauthorizedException('Token not provided');
      }
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      if (!decoded) {
        throw new UnauthorizedException('Invalid token');
      }
      req.user = decoded;
    } catch (error) {
      console.log(error);
      this.logService.Logger({request: "Service Request", source: "AuthMiddleware ", timestamp: new Date(), queryParams: false, bodyParams: false, response: "Token Missing in Auth Headers/ Wrong Token", error: error})
      res.status(401).json({message: "token missing/expired", error: error})
    }
    next();
  }
}
