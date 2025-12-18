import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification } from './schema/notification.schema';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name)
    private NotificationModel: Model<Notification>,
  ) {}

  async create(createNotificationDto: CreateNotificationDto) {
    const newNotification = new this.NotificationModel(createNotificationDto);

    return await newNotification.save();
  }

  async getNotifByDeviceId(deviceId: string) {
    return await this.NotificationModel.find({ deviceId }).sort({
      createdAt: -1,
    });
  }

  async deleteAll() {
    await this.NotificationModel.deleteMany();
  }

  async getUnreadNotifCount(deviceId: string) {
    const count = await this.NotificationModel.countDocuments({
      deviceId: deviceId,
      read: false,
    });

    return count;
  }

  async markedAsRead(notifId: string) {
    await this.NotificationModel.updateOne(
      { _id: notifId },
      { $set: { read: true } },
    );
  }
}
