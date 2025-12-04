import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { DeviceService } from './device.service';
import { CreateDeviceDto } from './dto/create_device.dto';
import { UpdateDeviceDto } from './dto/update_device.dto';

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

  @Patch(':deviceId')
  update(
    @Param('deviceId') deviceId: string,
    @Body() payload: UpdateDeviceDto,
  ) {
    console.log(deviceId);
    return this.deviceService.updateDevice(deviceId, payload);
  }

  @Delete()
  deleteAll() {
    this.deviceService.deleteAll();
  }
}
