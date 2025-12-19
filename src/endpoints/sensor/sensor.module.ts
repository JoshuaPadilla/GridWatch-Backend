import { Module } from '@nestjs/common';
import { SensorService } from './sensor.service';
import { SensorController } from './sensor.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  SensorPayload,
  SensorPayloadSchema,
} from './schema/sensor_payload.schema';
import { SensorGateway } from 'src/events/sensor.gateway';
import { Device, DeviceSchema } from '../device/schema/device.schema';
import { LocationModule } from '../location/location.module';
import { NotificationModule } from '../notification/notification.module';
import { EventsGateway } from 'src/events/events.gateway';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule.register({
      baseURL: 'http://localhost:3001/predict_outage',
      timeout: 3000,
    }),
    NotificationModule,
    LocationModule,
    MongooseModule.forFeature([
      { name: SensorPayload.name, schema: SensorPayloadSchema },
      { name: Device.name, schema: DeviceSchema },
    ]),
  ],
  controllers: [SensorController],
  providers: [SensorService, EventsGateway],
})
export class SensorModule {}
