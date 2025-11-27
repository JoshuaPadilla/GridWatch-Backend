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

@Module({
  imports: [
    LocationModule,
    MongooseModule.forFeature([
      { name: SensorPayload.name, schema: SensorPayloadSchema },
      { name: Device.name, schema: DeviceSchema },
    ]),
  ],
  controllers: [SensorController],
  providers: [SensorService, SensorGateway],
})
export class SensorModule {}
