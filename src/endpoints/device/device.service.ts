import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Device } from './schema/device.schema';
import { Model } from 'mongoose';
import { CreateDeviceDto } from './dto/create_device.dto';

@Injectable()
export class DeviceService {
  constructor(
    @InjectModel(Device.name)
    private DeviceModel: Model<Device>,
  ) {}

  async create(createDeviceDto: CreateDeviceDto): Promise<Device> {
    const newDevice = new this.DeviceModel(createDeviceDto);

    return await newDevice.save();
  }

  async findAll() {
    return await this.DeviceModel.find();
  }
}
