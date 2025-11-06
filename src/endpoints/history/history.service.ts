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

  async getHistoryByDevice(deviceId: string) {
    const histories = await this.historyModel.find({ deviceId });

    return histories;
  }
}
