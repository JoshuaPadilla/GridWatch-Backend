import {
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateHistoryDto {
  @IsString()
  deviceId: string;

  @IsString()
  time: string;

  @IsString()
  date: string;

  @IsString()
  title: string;

  @IsString()
  body: string;

  @IsString()
  status: string;
}
