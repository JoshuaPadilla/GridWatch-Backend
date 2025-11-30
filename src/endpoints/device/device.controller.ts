import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { DeviceService } from './device.service';
import { CreateDeviceDto } from './dto/create_device.dto';

@Controller('device')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @Post()
  create(@Body() createDeviceDto: CreateDeviceDto) {
    return this.deviceService.create(createDeviceDto);
  }

  @Get(':deviceId')
  findOne(@Param('deviceId') deviceId: string) {
    return this.deviceService.findOne(deviceId);
  }

  @Get()
  findAll() {
    return this.deviceService.findAll();
  }

  @Delete()
  deleteAll() {
    this.deviceService.deleteAll();
  }
}
