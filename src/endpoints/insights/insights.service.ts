import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { History } from '../history/schema/history.schema';
import { Model } from 'mongoose';
import { Device } from '../device/schema/device.schema';
import { SensorPayload } from '../sensor/schema/sensor_payload.schema';
import { HISTORY_STATUS } from 'src/enums/history_status.enum';
import { DEVICE_STATUS } from 'src/enums/device_status.enums';

@Injectable()
export class InsightsService {
  constructor(
    @InjectModel(History.name)
    private historyModel: Model<History>,
    @InjectModel(Device.name)
    private deviceModel: Model<Device>,
    @InjectModel(SensorPayload.name)
    private sensorPayloadModel: Model<SensorPayload>,
  ) {}

  async getInsightsNumbers() {
    const devices = await this.deviceModel.find();
    const histories = await this.historyModel.find();

    const stableDevices = devices.filter(
      (item) => item.status === DEVICE_STATUS.STABLE,
    ).length;

    const totalDevices = devices.length;

    const outagesReported = histories.filter(
      (item) => item.status === HISTORY_STATUS.OUTAGE,
    ).length;

    const totalRestored = histories.filter(
      (item) => item.status === HISTORY_STATUS.RESTORED,
    ).length;

    return { stableDevices, totalDevices, totalRestored, outagesReported };
  }
}
