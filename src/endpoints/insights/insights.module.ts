import { Module } from '@nestjs/common';
import { InsightsService } from './insights.service';
import { InsightsController } from './insights.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { History, HistorySchema } from '../history/schema/history.schema';
import {
  SensorPayload,
  SensorPayloadSchema,
} from '../sensor/schema/sensor_payload.schema';
import { Device, DeviceSchema } from '../device/schema/device.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: History.name, schema: HistorySchema },
      { name: SensorPayload.name, schema: SensorPayloadSchema },
      { name: Device.name, schema: DeviceSchema },
    ]),
  ],
  controllers: [InsightsController],
  providers: [InsightsService],
})
export class InsightsModule {}
