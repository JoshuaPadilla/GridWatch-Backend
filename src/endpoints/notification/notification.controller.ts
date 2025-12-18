import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  async create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationService.create(createNotificationDto);
  }

  @Get(':deviceId')
  async getNotifByDeviceId(@Param('deviceId') deviceId: string) {
    return this.notificationService.getNotifByDeviceId(deviceId);
  }

  @Get('unread_count/:deviceId')
  getUnreadCount(@Param('deviceId') deviceId: string) {
    return this.notificationService.getUnreadNotifCount(deviceId);
  }

  @Patch('marked_read/:notifId')
  markedAsRead(@Param('notifId') notifId: string) {
    return this.notificationService.markedAsRead(notifId);
  }

  @Delete()
  deleteAll() {
    this.notificationService.deleteAll();
  }
}
