import { Controller, Get, Query } from '@nestjs/common';
import { InsightsService } from './insights.service';

@Controller('insights')
export class InsightsController {
  constructor(private readonly insightsService: InsightsService) {}

  @Get()
  getInsightsNumbers() {
    return this.insightsService.getInsightsNumbers();
  }

  @Get('/outages_frequency')
  getOutagesFrequency() {
    return this.insightsService.getOutagesFrequency();
  }

  @Get('/outage_barchart_data')
  getOutageBarChartData(
    @Query('filter') filter: 'week' | 'month' | 'all' = 'all',
  ) {
    return this.insightsService.getOutageBarChartData(filter);
  }
}
