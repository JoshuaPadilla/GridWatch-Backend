import { PartialType } from '@nestjs/mapped-types';
import { CreateDeviceDto } from './create_device.dto';

export class UpdateDeviceDto extends PartialType(CreateDeviceDto) {}
