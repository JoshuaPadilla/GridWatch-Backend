import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { DEVICE_STATUS } from 'src/enums/device_status.enums';
import { LocationCoordinates } from 'src/interfaces/location_coor.interface';

@Schema()
export class Device extends Document {
  @Prop()
  deviceId: string;

  @Prop({ default: DEVICE_STATUS.NO_POWER })
  status?: DEVICE_STATUS;

  @Prop({
    type: {
      lat: { type: String, required: true },
      lng: { type: String, required: true },
    },
  })
  location?: LocationCoordinates;
}

export const DeviceSchema = SchemaFactory.createForClass(Device);

DeviceSchema.set('timestamps', true);
