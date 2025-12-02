import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SensorPayload } from './schema/sensor_payload.schema';
import { Model } from 'mongoose';
import { CreateSensorPayloadDto } from './dto/create-sensor-payload.dto';
import { SensorGateway } from 'src/events/sensor.gateway';
import { Device } from '../device/schema/device.schema';
import { LocationService } from '../location/location.service';
import { NotificationService } from '../notification/notification.service';
import { EventsGateway } from 'src/events/events.gateway';
import {
  CRITICAL_VOLTAGE_LOWER_LIMIT,
  WARNING_VOLTAGE_LOWER_LIMIT,
} from 'src/constants/voltage_threshold.constant';
import {
  getCriticalCurrentNotif,
  getCriticalVoltageNotif,
  getWarningCurrentNotfi,
  getWarningVoltageNotif,
} from 'src/helpers/getNotifications';
import {
  CRITICAL_CURRENT_UPPER_LIMIT,
  WARNING_CURRENT_UPPER_LIMIT,
} from 'src/constants/current_threshold.constant';
import { CreateNotificationDto } from '../notification/dto/create-notification.dto';

@Injectable()
export class SensorService {
  constructor(
    @InjectModel(Device.name)
    private DeviceModel: Model<Device>,
    @InjectModel(SensorPayload.name)
    private sensorPayloadModel: Model<SensorPayload>,
    private readonly eventsGateway: EventsGateway,
    private readonly locationService: LocationService,
    private readonly notificationService: NotificationService,
  ) {}

  // async create(deviceId: string) {
  //   const device = await this.DeviceModel.findOne({ deviceId });

  //   let voltage = Math.floor(Math.random() * (250 - 150 + 1)) + 150;

  //   let current = Math.floor(Math.random() * (50 - 20 + 1)) + 20;

  //   let temperature = Math.floor(Math.random() * (40 - 20 + 1)) + 20;

  //   const payload = {
  //     voltage,
  //     current,
  //     temperature,
  //     deviceId,
  //   } as SensorPayload;

  //   if (device) {
  //     const newPayload = new this.sensorPayloadModel(payload);

  //     const saved = await newPayload.save();

  //     const cleanPayload = saved.toJSON();
  //     this.eventsGateway.sendPayloadToDevice(payload.deviceId, cleanPayload);
  //   }
  // }

  async create(
    payloadDto: CreateSensorPayloadDto,
  ): Promise<SensorPayload | undefined> {
    const newDevice = await this.isNew(payloadDto.deviceId);

    if (newDevice) {
      this.checkPayloadThreshold(newDevice, payloadDto);
    }

    if (!newDevice) {
      const location_name = await this.locationService.getLocationName(
        payloadDto.locationCoordinates,
      );

      await this.DeviceModel.findOneAndUpdate(
        { deviceId: payloadDto.deviceId },
        {
          locationCoordinates: payloadDto.locationCoordinates,
          locationName: location_name,
        },
      );
    }

    const newPayload = new this.sensorPayloadModel(payloadDto);

    const saved = await newPayload.save();

    const cleanPayload = saved.toJSON();
    this.eventsGateway.sendPayloadToDevice(payloadDto.deviceId, cleanPayload);

    return saved;

    // const date = new Date(saved.createdAt);
    // const minutes = date.getMinutes().toString().padStart(2, '0');
    // const seconds = date.getSeconds().toString().padStart(2, '0');

    // return {
    //   ...saved.toObject(),
    //   createdAt: `${minutes}:${seconds}`,
    // } as unknown as SensorPayload;
  }

  private async isNew(deviceId: string): Promise<Device | undefined> {
    const device = await this.DeviceModel.findOne({ deviceId });
    if (device) {
      if (!device.locationCoordinates) return undefined;
    } else {
      throw new NotFoundException();
    }

    return device;
  }

  async getAll() {
    return this.sensorPayloadModel.find();
  }

  async getLast20DevicePayloads(deviceId: string) {
    const results = await this.sensorPayloadModel
      .find({ deviceId })
      .sort({ createdAt: -1 })
      .limit(20)
      .exec();

    // const convertedResults = results.map((item) => {
    //   // TypeScript now knows 'item' is just a plain object
    //   const date = new Date(item.createdAt);
    //   const minutes = date.getMinutes().toString().padStart(2, '0');
    //   const seconds = date.getSeconds().toString().padStart(2, '0');

    //   console.log('Original createdAt:', item.createdAt);

    //   return {
    //     ...item,
    //     createdAt: `${minutes}:${seconds}`,
    //   };
    // });

    return results;
  }

  async getLatestPayload(deviceId: string) {
    return this.sensorPayloadModel
      .findOne({ deviceId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async deleteAll() {
    await this.sensorPayloadModel.deleteMany();
  }

  private checkPayloadThreshold(
    device: Device,
    payload: CreateSensorPayloadDto,
  ) {
    let notification: CreateNotificationDto | undefined = undefined;
    const { voltage, current, deviceId } = payload;

    if (voltage <= CRITICAL_VOLTAGE_LOWER_LIMIT) {
      notification = getCriticalVoltageNotif(device, voltage);

      this.eventsGateway.sendNotificationToDevice(deviceId, notification);

      this.notificationService.create(notification);
    }

    if (current >= CRITICAL_CURRENT_UPPER_LIMIT) {
      notification = getCriticalCurrentNotif(device, current);

      this.eventsGateway.sendNotificationToDevice(deviceId, notification);

      this.notificationService.create(notification);
    }

    if (voltage <= WARNING_VOLTAGE_LOWER_LIMIT) {
      notification = getWarningVoltageNotif(device, current);

      this.eventsGateway.sendNotificationToDevice(deviceId, notification);

      this.notificationService.create(notification);
    }

    if (current <= WARNING_CURRENT_UPPER_LIMIT) {
      notification = getWarningCurrentNotfi(device, current);

      this.eventsGateway.sendNotificationToDevice(deviceId, notification);

      this.notificationService.create(notification);
    }
  }
}
