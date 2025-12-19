import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { History } from './schema/history.schema';
import { Model } from 'mongoose';
import { CreateHistoryDto } from './dto/create-history.dto';
import { SensorPayload } from '../sensor/schema/sensor_payload.schema';

@Injectable()
export class HistoryService {
  constructor(
    @InjectModel(History.name)
    private historyModel: Model<History>,
  ) {}

  async create(createHistoryDto: CreateHistoryDto) {
    const newHistory = new this.historyModel(createHistoryDto);

    await newHistory.save();
  }

  async findAll(query?: string) {
    // 1. Handle no query - return all, sorted by creation date
    if (!query) {
      return await this.historyModel.find().sort({ createdAt: -1 });
    }

    // Initialize the filter date (This will hold the start boundary $gte)
    let filter = new Date();

    // Set the filter based on the query
    switch (query) {
      case 'Today':
        // Set 'filter' to the start of the current day (00:00:00 of today)
        filter.setHours(0, 0, 0, 0);
        break; // <--- The crucial missing break statement

      case 'This Week':
        // Calculate the date 7 calendar days ago
        // Note: For 'This Week' (7 days), a simple subtraction is often used
        // For a calendar week (Sun-Sat), you'd need more complex logic.
        filter.setDate(filter.getDate() - 7);
        break; // <--- The crucial missing break statement

      case 'This Month':
        // Calculate the date 30 days ago (more accurate to use setMonth for full month)
        // filter.setMonth(filter.getMonth() - 1); // Use this for 1 calendar month ago
        filter.setDate(filter.getDate() - 30); // Use this for approximately 30 days ago
        break; // <--- The crucial missing break statement

      default:
        // Handle unexpected query values (e.g., return an empty array or an error)
        return [];
    }

    // 2. Execute the query using the calculated filter date
    return await this.historyModel
      .find({
        createdAt: {
          $gte: filter, // Greater than or equal to the calculated start time
          $lt: new Date(), // Less than the current time (end time)
        },
      })
      .sort({ createdAt: -1 });
  }

  async getHistoryByDevice(deviceId: string) {
    const histories = await this.historyModel.find({ deviceId });

    return histories;
  }

  async delete() {
    return this.historyModel.deleteMany();
  }
}
