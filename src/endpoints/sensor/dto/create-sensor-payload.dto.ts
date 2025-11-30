import {
  IsNotEmpty,
  IsNotEmptyObject,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { LocationCoordinates } from 'src/interfaces/location_coor.interface';

export class CreateSensorPayloadDto {
  @IsString()
  deviceId: string;

  @IsNumber()
  voltage: number;

  @IsNumber()
  current: number;

  @IsString()
  temperature: number;

  @IsString()
  @IsOptional()
  locationCoordinates: LocationCoordinates;

  @IsString()
  @IsOptional()
  time: string;

  @IsString()
  @IsOptional()
  localCreatedAt: string;
}
