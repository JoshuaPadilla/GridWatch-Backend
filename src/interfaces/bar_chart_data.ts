import { HISTORY_STATUS } from 'src/enums/history_status.enum';

export interface BarChartDataFrequency {
  restored?: number;
  outage?: number;
  name: string;
}

export interface BarChartData {
  data: BarChartDataFrequency[];
  relativeOutageValue: number;
  relativeRestoredValue: number;
  totalRestored: number;
  totalOutage: number;
}
