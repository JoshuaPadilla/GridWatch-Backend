import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { DEVICE_STATUS } from 'src/enums/device_status.enums';
import { LocationCoordinates } from 'src/interfaces/location_coor.interface';

@Schema()
export class LocationName extends Document {
  @Prop()
  road: string;

  @Prop()
  city: string;

  @Prop()
  brgy: string;
}

export const LocationNameSchema = SchemaFactory.createForClass(LocationName);
