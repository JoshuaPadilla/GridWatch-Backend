import { Type } from 'class-transformer';
import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { DEVICE_STATUS } from 'src/enums/device_status.enums';
import { LocationCoordinates } from 'src/interfaces/location_coor.interface';

export class CreateDeviceDto {
  @IsString()
  deviceId: string;

  @IsOptional()
  @IsEnum(DEVICE_STATUS)
  status: DEVICE_STATUS;

  @IsOptional()
  @IsObject()
  location: LocationCoordinates;
}
