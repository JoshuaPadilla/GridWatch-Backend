import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { SensorService } from './sensor.service';
import { SensorPayload } from './schema/sensor_payload.schema';
import { CreateSensorPayloadDto } from './dto/create-sensor-payload.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Device } from '../device/schema/device.schema';
import { Model } from 'mongoose';

@Controller('sensor')
export class SensorController {
  constructor(
    private readonly sensorService: SensorService,
    @InjectModel(Device.name)
    private DeviceModel: Model<Device>,
  ) {}

  @Post()
  async create(@Body() sensorPayload: CreateSensorPayloadDto) {
    const newPayload = await this.sensorService.create(sensorPayload);

    return newPayload;
  }

  @Get()
  async getAll() {
    return this.sensorService.getAll();
  }

  @Get(':deviceId')
  async getLast20DevicePayloads(@Param('deviceId') deviceId: string) {
    return this.sensorService.getLast20DevicePayloads(deviceId);
  }

  @Get('latest/:deviceId')
  async getLatestPayload(@Param('deviceId') deviceId: string) {
    return this.sensorService.getLatestPayload(deviceId);
  }

  @Delete()
  deleteAll() {
    this.sensorService.deleteAll();
  }
}
