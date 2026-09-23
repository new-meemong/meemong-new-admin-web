import { fetcher } from "@/apis/core";
import type {
  DailyStatistics,
  DashboardDateRange,
  DashboardPresets,
  MongDay,
  MongTotalsDay,
  PassDay,
  TimeSaleDay,
  UserStatistics,
  WithdrawalStatistics,
  LegacyMongDetailsResponse,
} from "./types";

const BASE_URL = "/api/v1/un-auth/dashboards";
const getStatistics = <T>(
  endpoint: string,
  range: DashboardDateRange,
  signal?: AbortSignal,
) => fetcher<T>(`${BASE_URL}/${endpoint}`, { query: { ...range }, signal });

export const dashboardAPI = {
  legacyMongDetails: (signal?: AbortSignal) =>
    fetcher<LegacyMongDetailsResponse>(
      "/api/v1/un-auth/mong-statistics/details",
      { signal },
    ),
  presets: (signal?: AbortSignal) =>
    fetcher<DashboardPresets>(`${BASE_URL}/presets`, { signal }),
  users: (range: DashboardDateRange, signal?: AbortSignal) =>
    getStatistics<UserStatistics>("user-statistics", range, signal),
  withdrawals: (range: DashboardDateRange, signal?: AbortSignal) =>
    getStatistics<WithdrawalStatistics>("withdrawal-statistics", range, signal),
  mong: (range: DashboardDateRange, signal?: AbortSignal) =>
    getStatistics<DailyStatistics<MongDay>>("mong-statistics", range, signal),
  mongTotals: (range: DashboardDateRange, signal?: AbortSignal) =>
    getStatistics<DailyStatistics<MongTotalsDay>>(
      "mong-statistics/totals",
      range,
      signal,
    ),
  passes: (range: DashboardDateRange, signal?: AbortSignal) =>
    getStatistics<DailyStatistics<PassDay>>(
      "meemong-pass-statistics",
      range,
      signal,
    ),
  timeSales: (range: DashboardDateRange, signal?: AbortSignal) =>
    getStatistics<DailyStatistics<TimeSaleDay>>(
      "time-sale-menu-statistics",
      range,
      signal,
    ),
};
