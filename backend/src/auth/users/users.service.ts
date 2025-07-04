import { Injectable} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schema/users.schema';
import { Model } from 'mongoose';
import { HashPass, Response, SigninResponse, UserData} from '../dto';
import * as argon from "argon2";
import { LogInfoService } from '../logger/logger.service';
import { SessionService } from '../session/session.service';

@Injectable()
export class UsersService {
  constructor(private sessionService: SessionService, private logService: LogInfoService, @InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findUser(data: UserData): Promise<User | null> {
    try {
      const user = await this.userModel.findOne({ user: data.user }).lean().exec();
      if(user){
        this.logService.Logger({request: "User Search", source: "users service -> findUser", timestamp: new Date(), queryParams: false, bodyParams: true, response: "User does not exist", error: "none"})
      } else {
        this.logService.Logger({request: "User Search", source: "users service -> findUser", timestamp: new Date(), queryParams: false, bodyParams: true, response: "User exists", error: "none"})
      }
      return user;
    } catch (error) {
      this.logService.Logger({request: "User Search", source: "users service -> findUser", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Error searching User", error: error})
      return null;
    }
  }

  async createAccount(data: UserData): Promise<User | null> {
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

  async hashPassword(data: UserData): Promise<Response> {
    try {
      const hash = await argon.hash(data.password);
      return { success: true, response: hash };
    } catch (error) {
      this.logService.Logger({request: "Hash Password", source: "users service -> hashPassword", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Error hashing the password", error: error})
      return { success: false, response: "Error hashing the password" };
    }
  }

  async verifyPassword(data: HashPass): Promise<Response> {
    try {
      const isMatch = await argon.verify(data.hash, data.plain);
      return { success: isMatch, response: isMatch ? "Password successfully authenticated" : "Invalid password", };
    } catch (error) {
      this.logService.Logger({request: "Verify Password", source: "users service -> verifyPassword", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Error verifying the password", error: error})
      return {  success: false, response: "Password authentication failed", };
    }
  }

  async signin(data: UserData): Promise<SigninResponse> {
    try {
      const user = await this.findUser(data);
      if (!user) return { success: false, response: "User does not exist", accessToken: null, refreshToken: null};
      const passwordCheck = await this.verifyPassword({ hash: user.password, plain: data.password });
      if(!passwordCheck.success) return { success: false, response: "Invalid password", accessToken: null, refreshToken: null};
      const token = this.sessionService.genToken({user: data.user, password: data.password});
      if(token.accessToken && token.refreshToken){
        this.logService.Logger({request: "User Signin", source: "users service -> signin", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Signin successful", error: "none"})
        return { success: true, response: "Signin successful", accessToken: token.accessToken, refreshToken: token.refreshToken, username: user.username}
      } else {
        this.logService.Logger({request: "User Signin", source: "users service -> signin", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Token generation failed", error: "none"})
        return { success: false, response: "Token generation failed", accessToken: null, refreshToken: null};
      }
    } catch (error) {
      this.logService.Logger({request: "User Signin", source: "users service -> signin", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Error during signin", error: error})
      return { success: false, response: "An error occurred during signin", accessToken: null, refreshToken: null  };
    }
  }

  async signup(data: UserData): Promise<SigninResponse> {
    try {
      const userExists = await this.findUser({ user: data.user, password: data.password });
      if (userExists) return { success: false, response: "User already exists. Use another contact.", accessToken: null, refreshToken: null };
      const hashResponse = await this.hashPassword(data);
      if (!hashResponse.success) return { success: false, response: hashResponse.response, accessToken: null, refreshToken: null  };
      const user = await this.createAccount({ username: data.username, user: data.user, password: hashResponse.response});
      this.logService.Logger({request: "User Signup", source: "users service -> signup", timestamp: new Date(), queryParams: false, bodyParams: true, response: user? "Signup successful" : "Signup Failed - Unable to create am account", error: "none"})
      const token = this.sessionService.genToken({user: data.user, password: data.password});
      if(token.accessToken && token.refreshToken){
        this.logService.Logger({request: "User Signup", source: "users service -> signup", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Signup successful", error: "none"})
        return { success: true, response: "Account setup successful", accessToken: token.accessToken, refreshToken: token.refreshToken, username: data.username}
      } else {
        this.logService.Logger({request: "User Signup", source: "users service -> signup", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Token generation failed", error: "none"})
        return { success: false, response: "Failed to create account - Token generation failed", accessToken: null, refreshToken: null};
      }
    } catch (error) {
      this.logService.Logger({request: "User Signup", source: "users service -> signup", timestamp: new Date(), queryParams: false, bodyParams: true, response: "Error during signup", error: error})
      return { success: false, response: "An error occurred during signup", accessToken: null, refreshToken: null  };
    }
  }
}
