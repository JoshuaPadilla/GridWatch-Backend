import {
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class SensorPayloadDto {
  @IsString()
  sensorId: string;

  @IsString()
  voltage: string;

  @IsString()
  current: string;

  @IsString()
  temperature: string;

  @IsString()
  @IsOptional()
  location: string;

  @IsString()
  @IsOptional()
  time: string;
}
