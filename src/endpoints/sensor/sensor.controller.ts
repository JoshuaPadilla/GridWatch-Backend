import { Body, Controller, Post } from '@nestjs/common';
import { SensorService } from './sensor.service';
import { SensorPayload } from './schema/sensor_payload.schema';
import { SensorPayloadDto } from './dto/create-sensor-payload.dto';

@Controller('sensor')
export class SensorController {
  constructor(private readonly sensorService: SensorService) {}

  @Post()
  async create(@Body() sensorPayload: SensorPayloadDto) {
    const newPayload = await this.sensorService.create(sensorPayload);

    return newPayload;
  }
}
