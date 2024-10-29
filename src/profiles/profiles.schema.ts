import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';

@Schema()
export class Profile extends Document {
  @Prop({ required: true })
  displayName: string;

  @Prop({ required: false })
  gender?: string;

  @Prop({ required: false })
  birthday?: Date;

  @Prop({ required: false })
  horoscope?: string;

  @Prop({ required: false })
  zodiac?: string;

  @Prop({ required: false })
  height?: number; // in cm

  @Prop({ required: false })
  weight?: number; // in kg

  @Prop({ required: false })
  image?: string; // To store Base64 image

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' }) 
  user: string;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);
