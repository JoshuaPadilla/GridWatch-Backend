import { Module } from '@nestjs/common';
import { SensorService } from './sensor.service';
import { SensorController } from './sensor.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  SensorPayload,
  SensorPayloadSchema,
} from './schema/sensor_payload.schema';
import { SensorGateway } from 'src/events/sensor.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SensorPayload.name, schema: SensorPayloadSchema },
    ]),
  ],
  controllers: [SensorController],
  providers: [SensorService, SensorGateway],
})
export class SensorModule {}
