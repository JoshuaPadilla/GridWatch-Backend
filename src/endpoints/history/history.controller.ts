import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { HistoryService } from './history.service';
import { CreateHistoryDto } from './dto/create-history.dto';
import { filter } from 'rxjs';

@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Post()
  async create(@Body() createHistoryDto: CreateHistoryDto) {
    return await this.historyService.create(createHistoryDto);
  }

  @Get()
  async findAll(@Query() query: { filter: string }) {
    return this.historyService.findAll(query.filter);
  }

  @Get(':deviceId')
  async getHistoryByDevice(@Param('deviceId') deviceId: string) {
    return this.historyService.getHistoryByDevice(deviceId);
  }

  @Delete()
  async delete() {
    await this.historyService.delete();
  }
}
