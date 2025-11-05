import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class SensorPayload extends Document {
  @Prop()
  sensorId: string;

  @Prop({})
  voltage: number;

  @Prop()
  current: string;

  @Prop()
  temperature: string;

  @Prop()
  location: string;

  @Prop()
  time: string;
}

export const SensorPayloadSchema = SchemaFactory.createForClass(SensorPayload);
