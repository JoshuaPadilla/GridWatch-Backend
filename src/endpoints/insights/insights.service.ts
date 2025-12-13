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

  async getOutageBarChartData(filter: 'week' | 'month' | 'all') {
    const today = new Date();
    let matchDate: Date;
    let dateFormat: string;

    // 1. Configure Filter
    if (filter === 'all') {
      matchDate = new Date(today.getFullYear(), 0, 1); // Jan 1st
      dateFormat = '%b'; // "Jan"
    } else {
      matchDate = new Date(today);
      matchDate.setDate(today.getDate() - 6); // Go back 6 days (Today + 6 prev days = 7 days)
      matchDate.setHours(0, 0, 0, 0); // Start of that day
      dateFormat = '%d-%b'; // "13-Dec"
    }

    // 2. Fetch Data from DB
    const results = await this.historyModel.aggregate([
      { $match: { createdAt: { $gte: matchDate } } },
      {
        $project: {
          status: 1,
          label: { $dateToString: { format: dateFormat, date: '$createdAt' } },
        },
      },
      {
        $group: {
          _id: { label: '$label', status: '$status' },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.label',
          data: { $push: { k: '$_id.status', v: '$count' } },
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [{ $arrayToObject: '$data' }, { name: '$_id' }],
          },
        },
      },
    ]);

    // 3. Fill Missing Dates (0 counts)
    return this.fillMissingDates(results, filter);
  }

  // Helper to fill gaps
  private fillMissingDates(data: any[], filter: 'week' | 'all' | 'month') {
    let expectedLabels: string[] = [];

    if (filter === 'all') {
      // Static list of months
      expectedLabels = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];
    } else {
      // Dynamic list of past 7 days
      expectedLabels = [];
      const d = new Date();
      // Loop 6 times backwards from today
      for (let i = 6; i >= 0; i--) {
        const tempDate = new Date();
        tempDate.setDate(d.getDate() - i);

        // Manual formatting to match Mongo's %d-%b (e.g., "13-Dec")
        const day = tempDate.getDate().toString().padStart(2, '0');
        const month = tempDate.toLocaleString('default', { month: 'short' });
        expectedLabels.push(`${day}-${month}`);
      }
    }

    // Merge logic
    return expectedLabels.map((label) => {
      const found = data.find((d) => d.name === label);
      // Return found data OR default 0s
      return found || { name: label, restored: 0 };
    });
  }
}
