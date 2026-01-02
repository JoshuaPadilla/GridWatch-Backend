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
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { DEVICE_STATUS } from 'src/enums/device_status.enums';
import { LocationCoordinates } from 'src/interfaces/location_coor.interface';

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
    private readonly httpService: HttpService,
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

  // async testLocation(locatiocoor: LocationCoordinates) {
  //   return this.locationService.getLocationName(locatiocoor);
  // }

  async create(
    payloadDto: CreateSensorPayloadDto,
  ): Promise<SensorPayload | undefined> {
    const newDevice = await this.isNew(payloadDto.deviceId);

    if (newDevice && payloadDto.locationCoordinates) {
      const isSameCoor = this.compareCoordinates(
        payloadDto.locationCoordinates,
        newDevice.locationCoordinates,
      );

      if (!isSameCoor) {
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

      const res = await firstValueFrom(this.httpService.post('', payloadDto));

      let riskScore = 0;

      if (res.status === 200) {
        riskScore = res.data.risk_score;
        this.eventsGateway.sendDevicePrediction(
          payloadDto.deviceId,
          res.data.risk_score,
        );
      }

      // check for voltage or current to send notification
      this.checkPayloadThreshold(newDevice, payloadDto, riskScore);
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
      .sort({ updatedAt: -1 })
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

  private async checkPayloadThreshold(
    device: Device,
    payload: CreateSensorPayloadDto,
    riskScore: number,
  ) {
    let notificationFromPayload: CreateNotificationDto | undefined = undefined;
    const { voltage, current, deviceId } = payload;

    if (voltage === 0) {
      this.changeDeviceStatus(device, DEVICE_STATUS.NO_POWER);

      return;
    }

    if (voltage <= CRITICAL_VOLTAGE_LOWER_LIMIT) {
      notificationFromPayload = getCriticalVoltageNotif(
        device,
        voltage,
        riskScore,
      );

      const savedNotif = await this.notificationService.create(
        notificationFromPayload,
      );

      this.eventsGateway.sendNotificationToDevice(deviceId, savedNotif);

      this.changeDeviceStatus(device, DEVICE_STATUS.LOW);
    } else if (voltage <= WARNING_VOLTAGE_LOWER_LIMIT) {
      notificationFromPayload = getWarningVoltageNotif(
        device,
        voltage,
        riskScore,
      );

      const savedNotif = await this.notificationService.create(
        notificationFromPayload,
      );

      this.eventsGateway.sendNotificationToDevice(deviceId, savedNotif);

      this.changeDeviceStatus(device, DEVICE_STATUS.FLUCTUATING);
    }

    if (current >= CRITICAL_CURRENT_UPPER_LIMIT) {
      notificationFromPayload = getCriticalCurrentNotif(
        device,
        current,
        riskScore,
      );

      const savedNotif = await this.notificationService.create(
        notificationFromPayload,
      );

      this.eventsGateway.sendNotificationToDevice(deviceId, savedNotif);

      this.changeDeviceStatus(device, DEVICE_STATUS.CURRENT_OVERLOAD);
    } else if (current >= WARNING_CURRENT_UPPER_LIMIT) {
      notificationFromPayload = getWarningCurrentNotfi(
        device,
        current,
        riskScore,
      );

      const savedNotif = await this.notificationService.create(
        notificationFromPayload,
      );

      this.eventsGateway.sendNotificationToDevice(deviceId, savedNotif);

      this.changeDeviceStatus(device, DEVICE_STATUS.FLUCTUATING);
    }

    if (
      voltage > WARNING_VOLTAGE_LOWER_LIMIT &&
      current < WARNING_CURRENT_UPPER_LIMIT
    ) {
      this.changeDeviceStatus(device, DEVICE_STATUS.STABLE);
    }
  }

  private async changeDeviceStatus(device: Device, status: DEVICE_STATUS) {
    await this.DeviceModel.findByIdAndUpdate(device._id, { status: status });

    this.eventsGateway.changeDeviceStatus(device.deviceId, status);
  }

  private compareCoordinates(
    coor1?: LocationCoordinates,
    coor2?: LocationCoordinates,
  ): boolean {
    if (!coor1 || !coor2) {
      return false;
    }

    const lat1 = Number(coor1.lat);
    const lat2 = Number(coor2.lat);
    const lng1 = Number(coor1.lng);
    const lng2 = Number(coor2.lng);
    return lat1 === lat2 && lng1 === lng2;
  }
}
