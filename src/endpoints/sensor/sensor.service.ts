import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SensorPayload } from './schema/sensor_payload.schema';
import { Model } from 'mongoose';
import { CreateSensorPayloadDto } from './dto/create-sensor-payload.dto';
import { SensorGateway } from 'src/events/sensor.gateway';

@Injectable()
export class SensorService {
  constructor(
    @InjectModel(SensorPayload.name)
    private sensorPayloadModel: Model<SensorPayload>,
    private readonly sensorGateway: SensorGateway,
  ) {}

  async create(payloadDto: CreateSensorPayloadDto): Promise<SensorPayload> {
    const newPayload = new this.sensorPayloadModel(payloadDto);

    this.sensorGateway.sendPayload(payloadDto.deviceId, payloadDto);
    return newPayload.save();
  }
}
