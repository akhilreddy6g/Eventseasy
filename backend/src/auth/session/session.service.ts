import { Injectable } from "@nestjs/common";
import { AccToken, Tokens, UserData } from "../dto";
import { LogInfoService } from "../logger/logger.service";
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class SessionService {
    constructor(private logService: LogInfoService){}
    async genToken(data: UserData): Promise<Tokens> {
        try {
            const accessToken = jwt.sign(data, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m', issuer: process.env.ACCESS_ISSUER });
            const refreshToken = jwt.sign(data, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '30d', issuer: process.env.REFRESH_ISSUER });
            this.logService.Logger({request: "Token Generation Service", source: "session service -> genToken ", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Tokens generated", error: "none"})
            return { accessToken: accessToken, refreshToken: refreshToken };
        } catch (error) {
            this.logService.Logger({request: "Token Generation Service", source: "session service -> genToken ", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Error generating tokens", error: error})
            return { accessToken: null, refreshToken: null }
        }
    }

    async verToken(data: AccToken) {
        try {
            const user = jwt.verify(data.accessToken, process.env.ACCESS_TOKEN_SECRET);
            this.logService.Logger({request: "Token Verification Service", source: "session service -> verToken ", timestamp: new Date(), queryParams: true, bodyParams: false, response: "Token verified", error: "none"})
            return { user: user, Authenticated: true };
        } catch (error) {
            this.logService.Logger({request: "Token Verification Service", source: "session service -> verToken ", timestamp: new Date(), queryParams: true, bodyParams: false, response: "Error verifying token", error: error})
            return { user: null, Authenticated: false };
        }
    }
}