import { Controller, Get, Param, Query } from '@nestjs/common';
import { InsightsService } from './insights.service';

@Controller('insights')
export class InsightsController {
  constructor(private readonly insightsService: InsightsService) {}

  @Get()
  getInsightsNumbers(
    @Query('filter') filter: 'week' | 'month' | 'all' = 'all',
  ) {
    return this.insightsService.getInsightsNumbers(filter);
  }

  @Get('/outages_frequency')
  getOutagesFrequency(
    @Query('filter') filter: 'week' | 'month' | 'all' = 'all',
  ) {
    return this.insightsService.getOutagesFrequency(filter);
  }

  @Get('/outage_barchart_data/:deviceId')
  getOutageBarChartData(
    @Param('deviceId') deviceId: string,
    @Query('filter') filter: 'week' | 'month' | 'all' = 'all',
  ) {
    return this.insightsService.getOutageBarChartData(deviceId, filter);
  }
}
