import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { NOTIFICATION_STATUS } from 'src/enums/notification_status.enum';
import { LocationCoordinates } from 'src/interfaces/location_coor.interface';

@Schema()
export class Notification extends Document {
  @Prop({ required: true })
  deviceId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  body: string;

  @Prop({ default: false, required: false })
  read: boolean;

  @Prop({ default: 0, required: false })
  outagePercentage: number;

  @Prop({ type: String, enum: Object.values(NOTIFICATION_STATUS) })
  status: NOTIFICATION_STATUS;

  createdAt: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
NotificationSchema.set('timestamps', true);
