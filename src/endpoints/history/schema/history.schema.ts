import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { HISTORY_STATUS } from 'src/enums/history_status.enum';

@Schema()
export class History extends Document {
  @Prop()
  deviceId: string;

  @Prop()
  title: string;

  @Prop()
  body: string;

  @Prop({
    type: String,
    enum: Object.values(HISTORY_STATUS),
    default: HISTORY_STATUS.NOTIF,
  })
  status: HISTORY_STATUS;

  timestamps: string;
}

export const HistorySchema = SchemaFactory.createForClass(History);

HistorySchema.set('timestamps', true);
