import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { History } from '../history/schema/history.schema';
import { Model } from 'mongoose';
import { Device } from '../device/schema/device.schema';
import { SensorPayload } from '../sensor/schema/sensor_payload.schema';
import { HISTORY_STATUS } from 'src/enums/history_status.enum';
import { DEVICE_STATUS } from 'src/enums/device_status.enums';
import { HistoryFilter } from 'src/enums/history_filter';
import {
  BarChartData,
  BarChartDataFrequency,
} from 'src/interfaces/bar_chart_data';

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

  async getInsightsNumbers(filter: 'week' | 'month' | 'all') {
    // 1. Calculate the start date based on the filter
    const now = new Date();
    let startDate: Date | null = null;

    if (filter === 'week') {
      startDate = new Date();
      startDate.setDate(now.getDate() - 7);
    } else if (filter === 'month') {
      startDate = new Date();
      startDate.setMonth(now.getMonth() - 1);
    }

    // 2. Prepare the History Filter (Activity logs)
    const historyFilter: any = {};
    if (startDate) {
      historyFilter.createdAt = { $gte: startDate };
    }

    // 3. Execute queries in parallel
    const [stableDevices, totalDevices, outagesReported, totalRestored] =
      await Promise.all([
        // A. Device Inventory (Usually we want the Current Total, not filtered by date)
        this.deviceModel.countDocuments({ status: DEVICE_STATUS.STABLE }),
        this.deviceModel.countDocuments({}),

        // B. History Events (Filtered by the selected time range)
        this.historyModel.countDocuments({
          ...historyFilter, // Applies the date filter here
          status: HISTORY_STATUS.OUTAGE,
        }),
        this.historyModel.countDocuments({
          ...historyFilter, // Applies the date filter here
          status: HISTORY_STATUS.RESTORED,
        }),
      ]);

    return {
      stableDevices,
      totalDevices,
      totalRestored,
      outagesReported,
    };
  }

  async getOutagesFrequency(filter: 'week' | 'month' | 'all') {
    // 1. Calculate the start date based on the filter
    const now = new Date();
    let startDate: Date | null = null;

    if (filter === 'week') {
      startDate = new Date();
      startDate.setDate(now.getDate() - 7); // Last 7 days
    } else if (filter === 'month') {
      startDate = new Date();
      startDate.setMonth(now.getMonth() - 1); // Last 30 days/1 month
    }
    // If 'all', startDate remains null

    // 2. Build the Match Query
    const matchQuery: any = {
      status: HISTORY_STATUS.OUTAGE,
    };

    // Only add the date filter if it's not 'all'
    if (startDate) {
      matchQuery.createdAt = { $gte: startDate };
    }

    const dailyOutages = await this.historyModel
      .aggregate([
        // Stage 1: Filter by Status, Device, and Date Range
        {
          $match: matchQuery,
        },
        // Stage 2: Group by a SORTABLE date format (YYYY-MM-DD)
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            count: { $sum: 1 },
            // Keep a reference to the actual date for formatting later if needed
            dateObj: { $first: '$createdAt' },
          },
        },
        // Stage 3: Sort chronologically
        {
          $sort: { _id: 1 },
        },
        // Stage 4: Reformat to your desired output ("Dec 01")
        {
          $project: {
            _id: 0, // Remove the default _id
            date: {
              $dateToString: { format: '%b %d', date: '$dateObj' },
            },
            count: 1,
          },
        },
      ])
      .exec();

    return dailyOutages;
  }

  async getOutageBarChartData(
    deviceId: string, // <--- 1. Added deviceId parameter
    filter: 'week' | 'month' | 'all',
  ): Promise<BarChartData> {
    const today = new Date();
    let matchDate: Date;
    let dateFormat: string;

    // 1. Configure Filter
    if (filter === 'all') {
      matchDate = new Date(today.getFullYear(), 0, 1); // Jan 1st
      dateFormat = '%b'; // "Jan"
    } else {
      matchDate = new Date(today);
      matchDate.setDate(today.getDate() - 6); // Go back 6 days
      matchDate.setHours(0, 0, 0, 0);
      dateFormat = '%d-%b'; // "13-Dec"
    }

    // 2. Fetch Data from DB
    const results = await this.historyModel.aggregate([
      {
        $match: {
          deviceId: deviceId, // <--- 2. Filter by deviceId here
          // If your schema uses ObjectId for deviceId, use: deviceId: new Types.ObjectId(deviceId)
          createdAt: { $gte: matchDate },
        },
      },
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

    // 3. Process Data
    return this.fillMissingDates(results, filter);
  }

  private fillMissingDates(
    data: any[],
    filter: 'week' | 'all' | 'month',
  ): BarChartData {
    let expectedLabels: string[] = [];

    // Initialize Totals
    let totalRestored = 0;
    let totalOutage = 0;

    // A. Generate Labels
    if (filter === 'all') {
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
      const d = new Date();
      for (let i = 6; i >= 0; i--) {
        const tempDate = new Date();
        tempDate.setDate(d.getDate() - i);
        const day = tempDate.getDate().toString().padStart(2, '0');
        const month = tempDate.toLocaleString('default', { month: 'short' });
        expectedLabels.push(`${day}-${month}`);
      }
    }

    // B. Build Chart Data and Accumulate Totals
    const chartData: BarChartDataFrequency[] = expectedLabels.map((label) => {
      const found = data.find((d) => d.name === label);

      const restored = found?.restored || 0;
      const outage = found?.outage || 0;

      // Add to global totals
      totalRestored += restored;
      totalOutage += outage;

      return {
        name: label,
        restored,
        outage,
      };
    });

    // C. Calculate Relative Values
    const totalEvents = totalRestored + totalOutage;

    const relativeRestoredValue =
      totalEvents > 0
        ? parseFloat(((totalRestored / totalEvents) * 100).toFixed(2))
        : 0;

    const relativeOutageValue =
      totalEvents > 0
        ? parseFloat(((totalOutage / totalEvents) * 100).toFixed(2))
        : 0;

    // D. Return Final Shape
    return {
      data: chartData,
      relativeRestoredValue,
      relativeOutageValue,
      totalRestored,
      totalOutage,
    };
  }
}
