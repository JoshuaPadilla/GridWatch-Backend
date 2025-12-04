import {
  IsEnum,
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { HISTORY_STATUS } from 'src/enums/history_status.enum';

export class CreateHistoryDto {
  @IsString()
  deviceId: string;

  @IsString()
  title: string;

  @IsString()
  @IsEnum(HISTORY_STATUS)
  status: HISTORY_STATUS;

  @IsString()
  body: string;
}
