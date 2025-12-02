import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
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

  @Delete()
  deleteAll() {
    this.notificationService.deleteAll();
  }
}
