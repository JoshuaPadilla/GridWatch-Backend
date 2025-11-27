import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { LocationCoordinates } from 'src/interfaces/location_coor.interface';

@Schema()
export class SensorPayload extends Document {
  @Prop()
  deviceId: string;

  @Prop()
  voltage: number;

  @Prop()
  current: string;

  @Prop()
  temperature: string;

  @Prop({
    type: {
      lat: { type: String, required: true },
      lng: { type: String, required: true },
    },
  })
  locationCoordinates?: LocationCoordinates;
}

export const SensorPayloadSchema = SchemaFactory.createForClass(SensorPayload);
SensorPayloadSchema.set('timestamps', true);
