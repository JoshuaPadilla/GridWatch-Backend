import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { LocationCoordinates } from 'src/interfaces/location_coor.interface';

@Schema()
export class SensorPayload extends Document {
  @Prop()
  deviceId: string;

  @Prop()
  voltage: number;

  @Prop({})
  createdAt: Date;

  @Prop()
  current: number;

  @Prop()
  temperature: number;

  @Prop({
    type: {
      lat: { type: String, required: true },
      lng: { type: String, required: true },
    },
  })
  locationCoordinates?: LocationCoordinates;

  localCreatedAt?: string;
}

export const SensorPayloadSchema = SchemaFactory.createForClass(SensorPayload);
SensorPayloadSchema.set('timestamps', true);

SensorPayloadSchema.virtual('localCreatedAt').get(function () {
  return this.createdAt
    ? new Date(this.createdAt).toLocaleString('en-US', {
        timeZone: 'Asia/Manila',
        minute: '2-digit',
        second: '2-digit',
      })
    : '';
});

// Ensure virtuals are included when you convert to JSON
SensorPayloadSchema.set('toJSON', { virtuals: true });
SensorPayloadSchema.set('toObject', { virtuals: true });
