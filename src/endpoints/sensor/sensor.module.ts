import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventsGateway } from 'src/events/events.gateway';
import { Device, DeviceSchema } from '../device/schema/device.schema';
import { LocationModule } from '../location/location.module';
import { NotificationModule } from '../notification/notification.module';
import {
  SensorPayload,
  SensorPayloadSchema,
} from './schema/sensor_payload.schema';
import { SensorController } from './sensor.controller';
import { SensorService } from './sensor.service';

@Module({
  imports: [
    HttpModule.register({
      baseURL: 'http://127.0.0.1:3012',
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
