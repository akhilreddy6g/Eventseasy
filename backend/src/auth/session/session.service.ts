import { Injectable, Req } from "@nestjs/common";
import { AccToken, Tokens, UserData } from "../dto";
import { LogInfoService } from "../logger/logger.service";
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import { Request } from "express";
dotenv.config();

@Injectable()
export class SessionService {
    constructor(private logService: LogInfoService){}
    genToken(data: UserData): Tokens {
        try {
            const accessToken = jwt.sign({email: data.email, accType: data.accType}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m', issuer: process.env.ACCESS_ISSUER });
            const refreshToken = jwt.sign({email: data.email, accType: data.accType}, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '30d', issuer: process.env.REFRESH_ISSUER });
            this.logService.Logger({request: "Token Generation Service", source: "session service -> genToken ", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Tokens generated", error: "none"})
            return { accessToken: accessToken, refreshToken: refreshToken };
        } catch (error) {
            this.logService.Logger({request: "Token Generation Service", source: "session service -> genToken ", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Error generating tokens", error: error})
            return { accessToken: null, refreshToken: null }
        }
    }

    verToken(data: AccToken) {
        try {
            const user = jwt.verify(data.accessToken, process.env.ACCESS_TOKEN_SECRET);
            this.logService.Logger({request: "Token Verification Service", source: "session service -> verToken ", timestamp: new Date(), queryParams: true, bodyParams: false, response: "Token verified", error: "none"})
            return { user: user, Authenticated: true };
        } catch (error) {
            this.logService.Logger({request: "Token Verification Service", source: "session service -> verToken ", timestamp: new Date(), queryParams: true, bodyParams: false, response: "Error verifying token", error: error})
            return { user: null, Authenticated: false };
        }
    }

    refreshAccessToken(req: Request): Tokens{
        this.logService.Logger({request: "Access Token Regeneration Service", source: "session service -> refreshAccessToken", timestamp: new Date(), queryParams: false, bodyParams: false, response: "awaiting", error: "none"})
        try {
            const refreshToken = JSON.parse(req.cookies.auth)
            if(refreshToken){
                const truth = jwt.verify(refreshToken.rft, process.env.REFRESH_TOKEN_SECRET)
                const { email, accType} = truth as jwt.JwtPayload;
                if(truth){
                    const accessToken = jwt.sign({email: email, accType: accType }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m', issuer: process.env.ACCESS_ISSUER })
                    this.logService.Logger({request: "Access Token Regeneration Service", source: "session service -> refreshAccessToken", timestamp: new Date(), queryParams: false, bodyParams: false, response: "Successfully generated a new access token", error: "none"})
                    return {accessToken:accessToken, refreshToken:refreshToken, accType: accType, email: email}
                }
            }
        }catch(error) {
             this.logService.Logger({request: "Access Token Regeneration Service", source: "session service -> refreshAccessToken", timestamp: new Date(), queryParams: false, bodyParams: false, response: "Error generating a new access token", error: error})
        }
        this.logService.Logger({request: "Access Token Regeneration Service", source: "session service -> refreshAccessToken", timestamp: new Date(), queryParams: false, bodyParams: false, response: "Failed to generate a new access token", error: "none"})
        return {accessToken:null, refreshToken:null}
    }
}