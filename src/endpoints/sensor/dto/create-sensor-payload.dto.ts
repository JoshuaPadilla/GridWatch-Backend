import {
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { LocationCoordinates } from 'src/interfaces/location_coor.interface';

export class CreateSensorPayloadDto {
  @IsString()
  deviceId: string;

  @IsString()
  voltage: string;

  @IsString()
  current: string;

  @IsString()
  temperature: string;

  @IsString()
  @IsOptional()
  locationCoordinates: LocationCoordinates;

  @IsString()
  @IsOptional()
  time: string;
}
