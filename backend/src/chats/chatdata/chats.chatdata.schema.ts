import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { HydratedDocument } from "mongoose"
import { Chats } from "../dto/chats.dto";

export type ChatDocument = HydratedDocument<Chat>
export type ChatRestrictedUserDocument = HydratedDocument<Chat_Restricted_User>
export type ChatServersDocument = HydratedDocument<Chat_Servers>;
export type ChatMesssagesDocument = HydratedDocument<Chat_Messages>

@Schema({versionKey: false})
export class Chat {
    @Prop({})
    eventId: string
    
    @Prop({})
    chatName: string

    @Prop()
    chatDescription: string
    
    @Prop({})
    chatType: string
    
    @Prop({})
    chatDate: string
    
    @Prop({})
    chatStartTime: string
    
    @Prop({})
    chatEndTime: string

    @Prop({})
    chatStatus: boolean
    
    @Prop({ default: [] })
    restrictedUsers: string []
}

@Schema({versionKey: false})
export class Chat_Restricted_User {
    @Prop({})
    eventId: string

    @Prop({})
    chatId: string

    @Prop({})
    user: string
}

@Schema({versionKey: false})
export class Chat_Messages {
    @Prop({})
    eventId: string

    @Prop({})
    chats: Chats []
}

@Schema()
export class Chat_Servers {
    @Prop()
    csClientId: string

    @Prop()
    csApiUrl: string
}

export const ChatServersSchema = SchemaFactory.createForClass(Chat_Servers);
export const ChatSchema = SchemaFactory.createForClass(Chat)
export const ChatRestrictedUserSchema = SchemaFactory.createForClass(Chat_Restricted_User)
export const ChatMessagesSchema = SchemaFactory.createForClass(Chat_Messages)