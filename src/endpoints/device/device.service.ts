import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Device } from './schema/device.schema';
import { Model } from 'mongoose';
import { CreateDeviceDto } from './dto/create_device.dto';
import { LocationService } from '../location/location.service';

@Injectable()
export class DeviceService {
  constructor(
    @InjectModel(Device.name)
    private DeviceModel: Model<Device>,
    private readonly locationService: LocationService,
  ) {}

  async create(createDeviceDto: CreateDeviceDto): Promise<Device> {
    const newDevice = new this.DeviceModel(createDeviceDto);

    return await newDevice.save();
  }

  async findAll() {
    const devices = await this.DeviceModel.find();

    // const mappedDevices = devices.map((device) => {
    //   console.log(device);
    //   if (!device.locationName) {
    //     const resolvedLocationName =
    //       this.locationService.getLocationName(device);

    //     return { ...device, locationName: resolvedLocationName };
    //   }

    //   return device;
    // });

    return devices;
  }

  async deleteAll() {
    await this.DeviceModel.deleteMany();
  }
}
