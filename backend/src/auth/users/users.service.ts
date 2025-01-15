import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schema/users.schema';
import { Model } from 'mongoose';
import { AuthdtoSigin, AuthdtoSignup, HashPass, Response } from '../dto';
import * as argon from "argon2";
import { error } from 'console';

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}
  
    async findEmail(data: AuthdtoSigin): Promise<User> {
      try {
        const user = await this.userModel.findOne({ email: data.email}).lean().exec();  
        return user;
      } catch (error) {
        console.info("Error Finding the Password", error);
        return null;
      }
    }

    async createAccount(data: AuthdtoSignup): Promise<User> {
      try {
        const result = await this.userModel.insertMany([data]);
        const user = result[0].toObject(); 
        return user;
      } catch (error) {
        return null;
      }
    }   

    async hashPassword(data: AuthdtoSignup): Promise<Response> {
      try {
        const hash = await argon.hash(data.password);
        return {message: hash, success:true};
      } catch (error) {
        console.info("Error hashing the Password", error);
        return {message: "Unable to Hash the Password", success:false};
      }
    }

    async verifyPassword(data: HashPass): Promise<Response>{
      try {
        const isMatch = await argon.verify(data.hash, data.plain);
        return {message: "Password successfully authenticated", success: isMatch};
      } catch (error) {
        console.info("Error verifying Password", error);
        return {message: "Password authentication unsuccessful", success: false}
      }
    }

    async signin(data: AuthdtoSigin): Promise<Response> {
      try {
        const email = await this.findEmail(data);
        if(email){
          try {
            const checkEmail = await this.verifyPassword({hash: email.password, plain: data.password});
            if (checkEmail.success){
              return {message: "Authentication Succsessful", success: true}
            } else {
              return {message: "Invalid Password", success: false}
            }
          } catch (error) {
            return {message: error, success: false}
          }
        }
        else {
          return {message: "Email does not exist", success: false}
        }
      } catch (error) {
          return {message: error, success: false}
      }
    }

    async signup(data: AuthdtoSignup): Promise<Response> {
      try {
        const emailExists = await this.findEmail({email: data.email, password: data.password});
        if(emailExists){
            return {message: "Email exists. Use another email", success: false}
        } else {
            try {
              const hash = await this.hashPassword(data);
              if (hash.message){
                try {
                  const user = await this.createAccount({email: data.email, password: hash.message, accType: data.accType});
                  return {message: "Account setup successful", success: true}
                } catch (error) {
                  return {message: error, success: false}
                }
              } else {
                return {message: "Hash Unsuccessful", success: false}
              }
            } catch (error) {
              return {message: error, success: false}
            }
        }
      } catch (error) {
        return {message: error, success: false}
      }
    } 
  }
