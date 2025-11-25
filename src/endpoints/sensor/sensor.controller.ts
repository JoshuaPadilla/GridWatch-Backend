import { Body, Controller, Post } from '@nestjs/common';
import { SensorService } from './sensor.service';
import { SensorPayload } from './schema/sensor_payload.schema';
import { CreateSensorPayloadDto } from './dto/create-sensor-payload.dto';

@Controller('sensor')
export class SensorController {
  constructor(private readonly sensorService: SensorService) {}

  @Post()
  async create(@Body() sensorPayload: CreateSensorPayloadDto) {
    const newPayload = await this.sensorService.create(sensorPayload);

    return newPayload;
  }

  // @Post()
  // async sendLocation(@Body() location: any) {
  //   console.log(location);
  // }
}
