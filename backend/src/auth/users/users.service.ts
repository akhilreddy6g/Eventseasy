import { Injectable} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schema/users.schema';
import { Model } from 'mongoose';
import { AuthdtoSigin, AuthdtoSignup, HashPass, Response, SigninResponse } from '../dto';
import * as argon from "argon2";
import { LogInfoService } from '../logger/logger.service';
import { SessionService } from '../session/session.service';

@Injectable()
export class UsersService {
  constructor(private sessionService: SessionService, private logService: LogInfoService, @InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findEmail(data: AuthdtoSigin): Promise<User | null> {
    try {
      const user = await this.userModel.findOne({ email: data.email }).lean().exec();
      if(!user){
        this.logService.Logger({request: "Email Search", source: "users service -> findEmail", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Email does not exist", error: "none"})
      } else {
        this.logService.Logger({request: "Email Search", source: "users service -> findEmail", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Email exists", error: "none"})
      }
      return user;
    } catch (error) {
      console.error("Error finding the email:", error);
      this.logService.Logger({request: "Email Search", source: "users service -> findEmail", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Error searching email", error: error})
      return null;
    }
  }

  async createAccount(data: AuthdtoSignup): Promise<User | null> {
    try {
      const result = await this.userModel.insertMany([data]);
      if(result[0]){
        result[0]?.toObject()
      } else {
        this.logService.Logger({request: "Account Creation", source: "users service -> createAccount", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Failed to create an account", error: "none"});
        return null;
      }
    } catch (error) {
      this.logService.Logger({request: "Account Creation", source: "users service -> createAccount", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Error creating the account", error: error})
      return null;
    }
  }

  async hashPassword(data: AuthdtoSignup): Promise<Response> {
    try {
      const hash = await argon.hash(data.password);
      return { message: hash, success: true };
    } catch (error) {
      this.logService.Logger({request: "Hash Password", source: "users service -> hashPassword", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Error hashing the password", error: error})
      return { message: "Error hashing the password", success: false };
    }
  }

  async verifyPassword(data: HashPass): Promise<Response> {
    try {
      const isMatch = await argon.verify(data.hash, data.plain);
      return { message: isMatch ? "Password successfully authenticated" : "Invalid password", success: isMatch };
    } catch (error) {
      this.logService.Logger({request: "Verify Password", source: "users service -> verifyPassword", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Error verifying the password", error: error})
      return { message: "Password authentication failed", success: false };
    }
  }

  async signin(data: AuthdtoSigin): Promise<SigninResponse> {
    try {
      const user = await this.findEmail(data);
      if (!user) return { message: "Email does not exist", authneticated: false, accessToken: null, refreshToken: null };
      const passwordCheck = await this.verifyPassword({ hash: user.password, plain: data.password });
      if(!passwordCheck.success) return { message: "Invalid password", authneticated: false, accessToken: null, refreshToken: null };
      const token = await this.sessionService.genToken({email: data.email, password: data.password, accType: user.accType});
      if(token.accessToken && token.refreshToken){
        this.logService.Logger({request: "User Signin", source: "users service -> signin", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Signin successful", error: "none"})
        return { message: "Signin successful", authneticated: true, accessToken: token.accessToken, refreshToken: token.refreshToken}
      } else {
        this.logService.Logger({request: "User Signin", source: "users service -> signin", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Token generation failed", error: "none"})
        return { message: "Token generation failed", authneticated: false, accessToken: null, refreshToken: null};
      }
    } catch (error) {
      this.logService.Logger({request: "User Signin", source: "users service -> signin", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Error during signin", error: error})
      return { message: "Server error", authneticated: false, accessToken: null, refreshToken: null  };
    }
  }

  async signup(data: AuthdtoSignup): Promise<Response> {
    try {
      const emailExists = await this.findEmail({ email: data.email, password: data.password });
      if (emailExists) return { message: "Email already exists. Use another email.", success: false };
      const hashResponse = await this.hashPassword(data);
      if (!hashResponse.success) return { message: hashResponse.message, success: false };
      const user = await this.createAccount({ email: data.email, password: hashResponse.message, accType: data.accType });
      this.logService.Logger({request: "User Signup", source: "users service -> signup", timestamp: new Date(), queryParams: false, bodyParams: true, response: user? "Signup successful" : "Signup Failed - Unable to create am account", error: "none"})
      return user
        ? { message: "Account setup successful", success: true }
        : { message: "Failed to create account", success: false };
    } catch (error) {
      console.error("Error during signup:", error);
      this.logService.Logger({request: "User Signin", source: "users service -> signup", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Error during signup", error: error})
      return { message: "An error occurred during sign-up", success: false };
    }
  }
}
