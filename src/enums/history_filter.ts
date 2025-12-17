// history.service.ts or history.interface.ts

/** Defines the type of filtering/grouping to apply to the history records. */
export enum HistoryFilter {
  SEVEN_DAYS = '7-days',
  MONTHLY_FLAT = 'monthly-flat', // Last 30 days, no grouping
  MONTHLY_WEEKLY_GROUPED = 'monthly-weekly-grouped', // Last 30 days, grouped by week
  ALL = 'all',
}
