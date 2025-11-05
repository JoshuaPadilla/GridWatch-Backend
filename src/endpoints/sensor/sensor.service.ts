import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SensorPayload } from './schema/sensor_payload.schema';
import { Model } from 'mongoose';
import { SensorPayloadDto } from './dto/create-sensor-payload.dto';
import { SensorGateway } from 'src/events/sensor.gateway';

@Injectable()
export class SensorService {
  constructor(
    @InjectModel(SensorPayload.name)
    private sensorPayloadModel: Model<SensorPayload>,
    private readonly sensorGateway: SensorGateway,
  ) {}

  async create(payloadDto: SensorPayloadDto): Promise<SensorPayload> {
    const createdCat = new this.sensorPayloadModel(payloadDto);

    this.sensorGateway.sendPayload(payloadDto.sensorId, payloadDto);
    return createdCat.save();
  }
}
