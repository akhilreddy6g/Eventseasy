import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { HydratedDocument } from "mongoose"

export type ChatDocument = HydratedDocument<Chat>

@Schema({versionKey: false})
export class Chat {
    @Prop({required: true})
    eventId: string
    
    @Prop({required: true})
    chatName: string

    @Prop()
    chatDescription: string
    
    @Prop({required: true})
    chatType: string
    
    @Prop({required: true})
    chatDate: string
    
    @Prop({required: true})
    chatStartTime: string
    
    @Prop({required: true})
    chatEndTime: string

    @Prop({required: true})
    chatStatus: boolean
    
    @Prop({ required: true, type: [String], default: [] })
    restrictedUsers: string []
}

export const ChatSchema = SchemaFactory.createForClass(Chat)