import {
  IsEnum,
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { NOTIFICATION_STATUS } from 'src/enums/notification_status.enum';

export class CreateNotificationDto {
  @IsString()
  deviceId: string;

  @IsString()
  title: string;

  @IsString()
  body: string;

  @IsString()
  @IsEnum(NOTIFICATION_STATUS)
  status: NOTIFICATION_STATUS;
}
