import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ChatServersDocument = HydratedDocument<Chat_Servers>;

@Schema()
export class Chat_Servers {
    @Prop()
    csClientId: string

    @Prop()
    csApiUrl: string
}

export const ChatServersSchema = SchemaFactory.createForClass(Chat_Servers);