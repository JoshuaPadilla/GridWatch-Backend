import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class History extends Document {
  @Prop()
  deviceId: string;

  @Prop({})
  time: string;

  @Prop()
  date: string;

  @Prop()
  title: string;

  @Prop()
  body: string;

  @Prop()
  status: string;
}

export const HistorySchema = SchemaFactory.createForClass(History);
