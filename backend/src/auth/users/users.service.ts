import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schema/users.schema';
import { Model } from 'mongoose';
import { AuthdtoSigin, AuthdtoSignup } from '../dto';

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

    async create(data: AuthdtoSignup): Promise<User> {
      const result = await this.userModel.insertMany([data]);
      const user = result[0].toObject(); 
      return user;
    }    
  
    async findEmail(data: AuthdtoSigin): Promise<User> {
      const user = await this.userModel.findOne({ email: data.email}).lean().exec();  
      return user;
    }

    async verifyEmail(data: AuthdtoSigin): Promise<User> {
      const user = await this.userModel.findOne({ email: data.email, password: data.password }).lean().exec();  
      return user;
    }
  }
