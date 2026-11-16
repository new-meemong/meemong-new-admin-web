import { queryOptions, useQuery } from "@tanstack/react-query";
import { dashboardAPI } from "@/apis/dashboards";
import { getWithdrawalRecords } from "@/apis/dashboards/withdrawal-records";
import type { DashboardDateRange } from "@/apis/dashboards/types";

export const dashboardQueryOptions = {
  withdrawalRecords: (range: DashboardDateRange) =>
    queryOptions({
      queryKey: ["dashboard", "withdrawal-records", range],
      queryFn: ({ signal }) => getWithdrawalRecords(range, signal),
      staleTime: 60_000,
    }),
  legacyMongDetails: () =>
    queryOptions({
      queryKey: ["dashboard", "legacy-mong-details"],
      queryFn: ({ signal }) => dashboardAPI.legacyMongDetails(signal),
      staleTime: 60_000,
    }),
  users: (range: DashboardDateRange) =>
    queryOptions({
      queryKey: ["dashboard", "users", range],
      queryFn: ({ signal }) => dashboardAPI.users(range, signal),
      staleTime: 60_000,
    }),
  withdrawals: (range: DashboardDateRange) =>
    queryOptions({
      queryKey: ["dashboard", "withdrawals", range],
      queryFn: ({ signal }) => dashboardAPI.withdrawals(range, signal),
      staleTime: 60_000,
    }),
  mong: (range: DashboardDateRange) =>
    queryOptions({
      queryKey: ["dashboard", "mong", range],
      queryFn: ({ signal }) => dashboardAPI.mong(range, signal),
      staleTime: 60_000,
    }),
  mongTotals: (range: DashboardDateRange) =>
    queryOptions({
      queryKey: ["dashboard", "mong-totals", range],
      queryFn: ({ signal }) => dashboardAPI.mongTotals(range, signal),
      staleTime: 60_000,
    }),
  payments: (range: DashboardDateRange) =>
    queryOptions({
      queryKey: ["dashboard", "payments", range],
      queryFn: ({ signal }) => dashboardAPI.payments(range, signal),
      staleTime: 60_000,
    }),
  hairConsultations: (range: DashboardDateRange) =>
    queryOptions({
      queryKey: ["dashboard", "hair-consultations", range],
      queryFn: ({ signal }) => dashboardAPI.hairConsultations(range, signal),
      staleTime: 60_000,
    }),
  hairConsultationSummary: (range: DashboardDateRange) =>
    queryOptions({
      queryKey: ["dashboard", "hair-consultation-summary", range],
      queryFn: ({ signal }) =>
        dashboardAPI.hairConsultationSummary(range, signal),
      staleTime: 60_000,
    }),
  passes: (range: DashboardDateRange) =>
    queryOptions({
      queryKey: ["dashboard", "passes", range],
      queryFn: ({ signal }) => dashboardAPI.passes(range, signal),
      staleTime: 60_000,
    }),
  timeSales: (range: DashboardDateRange) =>
    queryOptions({
      queryKey: ["dashboard", "time-sales", range],
      queryFn: ({ signal }) => dashboardAPI.timeSales(range, signal),
      staleTime: 60_000,
    }),
  presets: () =>
    queryOptions({
      queryKey: ["dashboard", "presets"],
      queryFn: ({ signal }) => dashboardAPI.presets(signal),
      staleTime: 300_000,
    }),
};
export const useDashboardUsers = (range: DashboardDateRange) =>
  useQuery(dashboardQueryOptions.users(range));
export const useDashboardWithdrawals = (range: DashboardDateRange) =>
  useQuery(dashboardQueryOptions.withdrawals(range));
export const useDashboardMong = (range: DashboardDateRange) =>
  useQuery(dashboardQueryOptions.mong(range));
export const useDashboardPasses = (range: DashboardDateRange) =>
  useQuery(dashboardQueryOptions.passes(range));
export const useDashboardTimeSales = (range: DashboardDateRange) =>
  useQuery(dashboardQueryOptions.timeSales(range));
export const useDashboardPresets = () =>
  useQuery(dashboardQueryOptions.presets());
export const useDashboardLegacyMongDetails = () =>
  useQuery(dashboardQueryOptions.legacyMongDetails());
export const useDashboardWithdrawalRecords = (range: DashboardDateRange) =>
  useQuery(dashboardQueryOptions.withdrawalRecords(range));
export const useDashboardPayments = (range: DashboardDateRange) =>
  useQuery(dashboardQueryOptions.payments(range));
export const useDashboardHairConsultations = (range: DashboardDateRange) =>
  useQuery(dashboardQueryOptions.hairConsultations(range));
export const useDashboardHairConsultationSummary = (
  range: DashboardDateRange,
) => useQuery(dashboardQueryOptions.hairConsultationSummary(range));
