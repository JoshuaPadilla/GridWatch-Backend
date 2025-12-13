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

  async getOutagesFrequency() {
    const dailyOutages = await this.historyModel
      .aggregate([
        // 1. $match: Filter for only 'OUTAGE' status records.
        {
          $match: {
            status: HISTORY_STATUS.OUTAGE,
          },
        },
        // 2. $group: Group the documents by the day they were created and count them.
        {
          $group: {
            // Use an ID that extracts the year, month, and day from the 'createdAt' field
            _id: {
              $dateToString: { format: '%b %d', date: '$createdAt' },
            },
            // Count the documents in the group
            count: { $sum: 1 },
          },
        },
        // 3. $sort: Order the results chronologically by date (oldest first).
        {
          $sort: { _id: 1 },
        },
      ])
      .exec();

    // 4. Transform the result for a cleaner output format
    return dailyOutages.map((item) => ({
      date: item._id, // The date string (e.g., "2025-12-01")
      count: item.count, // The total number of outages on that day
    }));
  }
}
