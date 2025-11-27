import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { DEVICE_STATUS } from 'src/enums/device_status.enums';
import { LocationCoordinates } from 'src/interfaces/location_coor.interface';
import { LocationName } from 'src/schemas/location_name.schema';

export class CreateDeviceDto {
  @IsString()
  @IsNotEmpty()
  deviceId: string;

  @IsOptional()
  @IsEnum(DEVICE_STATUS)
  status: DEVICE_STATUS;

  @IsOptional()
  @IsObject()
  locationCoordinates: LocationCoordinates;

  @IsOptional()
  @IsObject()
  locationName: LocationName;
}
