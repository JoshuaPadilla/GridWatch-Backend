import { Module } from '@nestjs/common';
import { DeviceService } from './device.service';
import { DeviceController } from './device.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Device, DeviceSchema } from './schema/device.schema';

@Module({
  controllers: [DeviceController],
  providers: [DeviceService],
  imports: [
    MongooseModule.forFeature([{ name: Device.name, schema: DeviceSchema }]),
  ],
})
export class DeviceModule {}
