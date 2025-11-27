import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SensorPayload } from './schema/sensor_payload.schema';
import { Model } from 'mongoose';
import { CreateSensorPayloadDto } from './dto/create-sensor-payload.dto';
import { SensorGateway } from 'src/events/sensor.gateway';
import { Device } from '../device/schema/device.schema';
import { LocationService } from '../location/location.service';

@Injectable()
export class SensorService {
  constructor(
    @InjectModel(Device.name)
    private DeviceModel: Model<Device>,
    @InjectModel(SensorPayload.name)
    private sensorPayloadModel: Model<SensorPayload>,
    private readonly sensorGateway: SensorGateway,
    private readonly locationService: LocationService,
  ) {}

  async create(
    payloadDto: CreateSensorPayloadDto,
  ): Promise<SensorPayload | undefined> {
    const isNewDevice = await this.isNew(payloadDto.deviceId);

    if (isNewDevice) {
      const location_name = await this.locationService.getLocationName(
        payloadDto.locationCoordinates,
      );

      await this.DeviceModel.findOneAndUpdate(
        { deviceId: payloadDto.deviceId },
        {
          locationCoordinates: payloadDto.locationCoordinates,
          locationName: location_name,
        },
      );

      const newPayload = new this.sensorPayloadModel(payloadDto);

      this.sensorGateway.sendPayload(payloadDto.deviceId, payloadDto);

      return newPayload.save();
    } else {
      throw new NotFoundException();
    }
  }

  async isNew(deviceId: string): Promise<Boolean> {
    const device = await this.DeviceModel.findOne({ deviceId });
    if (device) {
      if (!device.locationCoordinates) return true;
    }

    return false;
  }

  async deleteAll() {
    await this.sensorPayloadModel.deleteMany();
  }
}
