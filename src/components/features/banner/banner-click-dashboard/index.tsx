"use client";

import React, { useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { type ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import CommonTable from "@/components/shared/common-table";
import CommonPagination from "@/components/shared/common-pagination";
import { DEFAULT_PAGINATION } from "@/components/shared/common-pagination/contants";
import BannerImageBox from "@/components/features/banner/banner-image-box";
import BannerStatusBadge from "@/components/features/banner/banner-status-badge";
import BannerClickTrendChart from "@/components/features/banner/banner-click-trend-chart";
import { useBannerContext } from "@/components/contexts/banner-context";
import {
  BANNER_CLICK_PERIOD_PRESETS,
  BANNER_CLICK_PLACEMENT_LABELS,
  MAX_CLICK_DOCS,
  type BannerClickPeriodPreset,
  type BannerClickPlacementId,
} from "@/constants/bannerClick";
import {
  useBannerClickCountQuery,
  useBannerClicksQuery,
} from "@/queries/bannerClicks";
import { useGetBannersQuery } from "@/queries/banners";
import {
  aggregateBannerClicks,
  deriveCurrentBannerPlacementId,
  filterBannerClicks,
  filterBannerClicksByBannerIds,
  getClickChangeRate,
  resolveBannerClickFilters,
} from "@/utils/bannerClickAnalytics";
import {
  createBannerClickDateRange,
  addDaysToDateKey,
  getInclusiveKstDayCount,
  getPreviousBannerClickDateRange,
  listKstDateKeys,
  toKstDateKey,
} from "@/utils/bannerClickDate";
import { firestoreDatabaseId } from "@/lib/firebase/client";
import { getFirestoreEnvironmentLabel } from "@/lib/firebase/database";
import { getBannerStatusesById, type BannerStatus } from "@/utils/banner";
import { cn } from "@/lib/utils";

interface DashboardBannerRow {
  bannerId: string;
  imageUrl?: string;
  userType: string;
  bannerType: string;
  placementIds: BannerClickPlacementId[];
  placementLabel: string;
  status: BannerStatus | "삭제·미매칭";
  clicks: number;
  averageDailyClicks: number;
  averageDayCount?: number;
  dailyClicks: Record<string, number>;
}

const numberFormatter = new Intl.NumberFormat("ko-KR");

function formatCount(value: number) {
  return `${numberFormatter.format(value)}회`;
}

function getErrorDetails(error: unknown) {
  if (!error || typeof error !== "object") return undefined;
  if ("code" in error && typeof error.code === "string") return error.code;
  if (error instanceof Error) return error.message;
  return undefined;
}

function getDefaultCustomDates() {
  const to = toKstDateKey(new Date());
  return { from: addDaysToDateKey(to, -29), to };
}

function SummaryCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description?: string;
}) {
  return (
    <div className="rounded-10 border bg-white p-5">
      <p className="mb-2 text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold text-foreground-strong">{value}</p>
      {description && (
        <p className="mt-2 text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

function getPlacementLabel(ids: BannerClickPlacementId[]) {
  if (!ids.length) return BANNER_CLICK_PLACEMENT_LABELS.unknown;
  return ids.map((id) => BANNER_CLICK_PLACEMENT_LABELS[id]).join(", ");
}

export default function BannerClickDashboard() {
  const { bannerTabValues } = useBannerContext();
  const [periodPreset, setPeriodPreset] =
    useState<BannerClickPeriodPreset>("30d");
  const defaultCustomDates = useMemo(getDefaultCustomDates, []);
  const [customFrom, setCustomFrom] = useState(defaultCustomDates.from);
  const [customTo, setCustomTo] = useState(defaultCustomDates.to);
  const [placementId, setPlacementId] = useState<
    BannerClickPlacementId | "all"
  >("all");
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [firstCompareBannerId, setFirstCompareBannerId] = useState("");
  const [secondCompareBannerId, setSecondCompareBannerId] = useState("");
  const [tablePage, setTablePage] = useState(DEFAULT_PAGINATION.page);
  const [tablePageSize, setTablePageSize] = useState(DEFAULT_PAGINATION.size);

  const rangeResult = useMemo(() => {
    try {
      return {
        range: createBannerClickDateRange(periodPreset, {
          customFrom,
          customTo,
        }),
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "기간을 확인해주세요.",
      };
    }
  }, [customFrom, customTo, periodPreset]);

  const range = rangeResult.range;
  const previousRange = useMemo(
    () => (range ? getPreviousBannerClickDateRange(range) : undefined),
    [range],
  );
  const filters = useMemo(
    () =>
      resolveBannerClickFilters({
        userType: bannerTabValues.userType,
        bannerType: bannerTabValues.bannerType,
        placementId: placementId === "all" ? undefined : placementId,
      }),
    [bannerTabValues.bannerType, bannerTabValues.userType, placementId],
  );
  const canUseServerPreviousCount =
    !showActiveOnly &&
    !filters.userType &&
    !filters.bannerType &&
    !filters.placementId;
  const clicksQuery = useBannerClicksQuery(
    range ?? createBannerClickDateRange("30d"),
    { enabled: Boolean(range) },
  );
  const previousClicksQuery = useBannerClicksQuery(
    previousRange ?? createBannerClickDateRange("30d"),
    { enabled: Boolean(previousRange) && !canUseServerPreviousCount },
  );
  const previousCountQuery = useBannerClickCountQuery(
    previousRange ?? createBannerClickDateRange("30d"),
    { enabled: Boolean(previousRange) && canUseServerPreviousCount },
  );
  const bannersQuery = useGetBannersQuery(
    {
      userType:
        bannerTabValues.bannerType === "바텀시트"
          ? undefined
          : bannerTabValues.userType,
      bannerType: bannerTabValues.bannerType,
      __cursorOrder: "createdAtDesc",
    },
    { enabled: true },
  );

  useEffect(() => {
    setFirstCompareBannerId("");
    setSecondCompareBannerId("");
    setTablePage(1);
  }, [
    bannerTabValues.bannerType,
    bannerTabValues.userType,
    customFrom,
    customTo,
    periodPreset,
    placementId,
    showActiveOnly,
  ]);

  const banners = useMemo(
    () => bannersQuery.data?.content ?? [],
    [bannersQuery.data?.content],
  );
  const bannerStatuses = useMemo(
    () => getBannerStatusesById(banners),
    [banners],
  );
  const activeBannerIds = useMemo(
    () =>
      new Set(
        banners
          .filter((banner) => bannerStatuses.get(banner.id) === "활성화")
          .map((banner) => String(banner.id)),
      ),
    [bannerStatuses, banners],
  );
  const currentClicks = useMemo(() => {
    const filteredClicks = filterBannerClicks(
      clicksQuery.data?.clicks ?? [],
      filters,
    );
    return showActiveOnly
      ? filterBannerClicksByBannerIds(filteredClicks, activeBannerIds)
      : filteredClicks;
  }, [activeBannerIds, clicksQuery.data?.clicks, filters, showActiveOnly]);
  const previousClicks = useMemo(() => {
    const filteredClicks = filterBannerClicks(
      previousClicksQuery.data?.clicks ?? [],
      filters,
    );
    return showActiveOnly
      ? filterBannerClicksByBannerIds(filteredClicks, activeBannerIds)
      : filteredClicks;
  }, [
    activeBannerIds,
    filters,
    previousClicksQuery.data?.clicks,
    showActiveOnly,
  ]);
  const aggregate = useMemo(
    () => aggregateBannerClicks(currentClicks),
    [currentClicks],
  );
  const previousAggregate = useMemo(
    () => aggregateBannerClicks(previousClicks),
    [previousClicks],
  );
  const dateKeys = useMemo(() => {
    if (!range) return [];
    if (range.fromDateKey) return listKstDateKeys(range);

    const firstClickDateKey = currentClicks[0]
      ? toKstDateKey(currentClicks[0].clickedAt)
      : undefined;
    return listKstDateKeys(range, firstClickDateKey);
  }, [currentClicks, range]);
  const dayCount = Math.max(1, dateKeys.length);

  const rows = useMemo<DashboardBannerRow[]>(() => {
    const clickByBanner = new Map(
      aggregate.byBanner.map((item) => [item.bannerId, item]),
    );
    const masterById = new Map(
      banners.map((banner) => [String(banner.id), banner]),
    );
    const masterRows = banners.flatMap((banner) => {
      const status = bannerStatuses.get(banner.id) ?? "비활성화";
      if (showActiveOnly && status !== "활성화") return [];

      const click = clickByBanner.get(String(banner.id));
      const configuredPlacementIds = [
        deriveCurrentBannerPlacementId(banner.userType, banner.bannerType),
      ];
      const placementIds = click?.placementIds ?? configuredPlacementIds;
      if (
        placementId !== "all" &&
        (!click || !click.placementIds.includes(placementId))
      ) {
        return [];
      }
      const bannerDayCount =
        periodPreset === "all"
          ? click
            ? getInclusiveKstDayCount(click.firstClickedAt, click.lastClickedAt)
            : undefined
          : dayCount;
      return [
        {
          bannerId: String(banner.id),
          imageUrl: banner.imageUrl,
          userType: banner.userType,
          bannerType: banner.bannerType,
          placementIds,
          placementLabel: click
            ? getPlacementLabel(placementIds)
            : `현재 설정 · ${getPlacementLabel(configuredPlacementIds)}`,
          status,
          clicks: click?.clicks ?? 0,
          averageDailyClicks: bannerDayCount
            ? (click?.clicks ?? 0) / bannerDayCount
            : 0,
          averageDayCount: bannerDayCount,
          dailyClicks: click?.dailyClicks ?? {},
        } satisfies DashboardBannerRow,
      ];
    });
    const unmatchedRows = aggregate.byBanner
      .filter((click) => !masterById.has(click.bannerId))
      .map((click) => {
        const bannerDayCount =
          periodPreset === "all"
            ? getInclusiveKstDayCount(click.firstClickedAt, click.lastClickedAt)
            : dayCount;
        return {
          bannerId: click.bannerId,
          userType: click.userType,
          bannerType: click.bannerType,
          placementIds: click.placementIds,
          placementLabel: getPlacementLabel(click.placementIds),
          status: "삭제·미매칭",
          clicks: click.clicks,
          averageDailyClicks: click.clicks / bannerDayCount,
          averageDayCount: bannerDayCount,
          dailyClicks: click.dailyClicks,
        } satisfies DashboardBannerRow;
      });
    return [...masterRows, ...unmatchedRows].sort(
      (a, b) => b.clicks - a.clicks,
    );
  }, [
    aggregate.byBanner,
    bannerStatuses,
    banners,
    dayCount,
    periodPreset,
    placementId,
    showActiveOnly,
  ]);

  const paginatedRows = useMemo(() => {
    const startIndex = (tablePage - 1) * tablePageSize;
    return rows.slice(startIndex, startIndex + tablePageSize);
  }, [rows, tablePage, tablePageSize]);

  useEffect(() => {
    const lastPage = Math.max(1, Math.ceil(rows.length / tablePageSize));
    if (tablePage > lastPage) setTablePage(lastPage);
  }, [rows.length, tablePage, tablePageSize]);

  const comparisonUnavailable = canUseServerPreviousCount
    ? previousCountQuery.isLoading || previousCountQuery.isError
    : previousClicksQuery.isLoading ||
      previousClicksQuery.isError ||
      previousClicksQuery.data?.isTruncated;
  const previousTotalClicks = canUseServerPreviousCount
    ? (previousCountQuery.data ?? 0)
    : previousAggregate.totalClicks;
  const changeRate = comparisonUnavailable
    ? undefined
    : getClickChangeRate(aggregate.totalClicks, previousTotalClicks);
  const nonEmptyPlacementEntries = Object.entries(aggregate.byPlacement).filter(
    ([, clicks]) => clicks > 0,
  ) as [BannerClickPlacementId, number][];

  const firstCompareRow = rows.find(
    (row) => row.bannerId === firstCompareBannerId,
  );
  const secondCompareRow = rows.find(
    (row) => row.bannerId === secondCompareBannerId,
  );
  const secondCompareCandidates = firstCompareRow
    ? rows.filter(
        (row) =>
          row.bannerId !== firstCompareRow.bannerId &&
          row.placementIds.some((id) =>
            firstCompareRow.placementIds.includes(id),
          ),
      )
    : [];

  const columns: ColumnDef<DashboardBannerRow>[] = [
    {
      accessorKey: "imageUrl",
      header: "이미지",
      size: 150,
      cell: ({ row }) =>
        row.original.imageUrl ? (
          <BannerImageBox src={row.original.imageUrl} width={120} height={40} />
        ) : (
          "-"
        ),
      enableSorting: false,
    },
    { accessorKey: "bannerId", header: "배너 ID", size: 90 },
    { accessorKey: "userType", header: "대상", size: 90 },
    { accessorKey: "bannerType", header: "유형", size: 110 },
    {
      accessorKey: "placementLabel",
      header: "위치",
      enableSorting: false,
    },
    {
      accessorKey: "status",
      header: "상태",
      size: 110,
      cell: ({ getValue }) => {
        const status = getValue() as DashboardBannerRow["status"];
        return status === "삭제·미매칭" ? (
          <span className="rounded-md bg-background-label px-2 py-1">
            {status}
          </span>
        ) : (
          <BannerStatusBadge status={status} />
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: "clicks",
      header: "클릭수",
      size: 100,
      cell: ({ getValue }) => formatCount(getValue() as number),
    },
    {
      accessorKey: "averageDailyClicks",
      header: periodPreset === "all" ? "클릭기간 일평균" : "기간 일평균",
      size: 120,
      cell: ({ getValue, row }) => {
        if (periodPreset === "all" && !row.original.averageDayCount) return "-";
        const periodLabel =
          periodPreset === "all" ? ` · ${row.original.averageDayCount}일` : "";
        return `${(getValue() as number).toFixed(1)}회/일${periodLabel}`;
      },
    },
  ];

  const isLoading = clicksQuery.isLoading || bannersQuery.isLoading;
  const isTruncated = clicksQuery.data?.isTruncated;
  const hasError = clicksQuery.isError || bannersQuery.isError;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-10 border bg-background-label px-4 py-3">
        <p className="text-sm">
          클릭 데이터만 집계합니다. 노출수와 CTR은 제공하지 않습니다.
        </p>
        <span
          className={cn(
            "rounded-full px-3 py-1 text-xs font-semibold",
            firestoreDatabaseId === "meemong-chat"
              ? "bg-green-100 text-green-700"
              : "bg-amber-100 text-amber-700",
          )}
        >
          {getFirestoreEnvironmentLabel(firestoreDatabaseId)} ·{" "}
          {firestoreDatabaseId}
        </span>
      </div>

      <section className="rounded-10 border bg-white p-4">
        <div className="flex flex-wrap items-center gap-2">
          {BANNER_CLICK_PERIOD_PRESETS.map((preset) => (
            <Button
              key={preset.value}
              variant="outline"
              className={cn(
                periodPreset === preset.value &&
                  "bg-secondary-background text-secondary-foreground",
              )}
              onClick={() => setPeriodPreset(preset.value)}
            >
              {preset.label}
            </Button>
          ))}
          {periodPreset === "custom" && (
            <>
              <Input
                type="date"
                size="sm"
                className="w-[160px]"
                value={customFrom}
                onChange={(event) => setCustomFrom(event.target.value)}
              />
              <span>~</span>
              <Input
                type="date"
                size="sm"
                className="w-[160px]"
                value={customTo}
                onChange={(event) => setCustomTo(event.target.value)}
              />
            </>
          )}
          <select
            aria-label="배너 위치 필터"
            className="h-9 min-w-[210px] rounded-md border bg-white px-3 text-sm"
            value={placementId}
            onChange={(event) =>
              setPlacementId(
                event.target.value as BannerClickPlacementId | "all",
              )
            }
          >
            <option value="all">모든 위치</option>
            {Object.entries(BANNER_CLICK_PLACEMENT_LABELS).map(
              ([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ),
            )}
          </select>
          <label className="flex cursor-pointer select-none items-center gap-1.5 px-1 text-sm">
            <Checkbox
              checked={showActiveOnly}
              onCheckedChange={(checked) => setShowActiveOnly(checked === true)}
            />
            <span>활성화된 배너만 보기</span>
          </label>
          <Button
            variant="outline"
            onClick={() => {
              clicksQuery.refetch();
              if (previousRange) {
                if (canUseServerPreviousCount) {
                  previousCountQuery.refetch();
                } else {
                  previousClicksQuery.refetch();
                }
              }
              bannersQuery.refetch();
            }}
          >
            <RefreshCw className="h-4 w-4" /> 새로고침
          </Button>
        </div>
        {rangeResult.error && (
          <p className="mt-3 text-sm text-negative">{rangeResult.error}</p>
        )}
        {(periodPreset === "7d" || periodPreset === "30d") && (
          <p className="mt-3 text-xs text-muted-foreground">
            오늘을 포함한 KST 기준이며, 오늘 데이터는 아직 진행 중입니다.
          </p>
        )}
        {showActiveOnly && (
          <p className="mt-2 text-xs text-muted-foreground">
            목록과 동일한 현재 상태 기준으로 활성화된 배너의 클릭만 집계합니다.
          </p>
        )}
      </section>

      {bannerTabValues.bannerType === "바텀시트" &&
        bannerTabValues.userType && (
          <div className="rounded-10 border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
            V1 바텀시트 클릭은 사용자 유형을 판별할 수 없어 대상 필터를 적용하지
            않습니다. 모델·디자이너 탭에서 동일한 전체 바텀시트 데이터가
            표시됩니다.
          </div>
        )}

      {clicksQuery.isError && (
        <div className="rounded-10 border border-red-200 bg-red-50 p-4 text-red-700">
          클릭 데이터를 불러오지 못했습니다. Firestore 권한과 네트워크를
          확인해주세요.
          {getErrorDetails(clicksQuery.error) && (
            <p className="mt-1 text-xs">
              오류: {getErrorDetails(clicksQuery.error)}
            </p>
          )}
        </div>
      )}
      {bannersQuery.isError && (
        <div className="rounded-10 border border-red-200 bg-red-50 p-4 text-red-700">
          배너 목록을 불러오지 못했습니다. API 연결 상태를 확인해주세요.
          {getErrorDetails(bannersQuery.error) && (
            <p className="mt-1 text-xs">
              오류: {getErrorDetails(bannersQuery.error)}
            </p>
          )}
        </div>
      )}
      {isTruncated && (
        <div className="rounded-10 border border-amber-300 bg-amber-50 p-4 text-amber-800">
          조회 결과가 {numberFormatter.format(MAX_CLICK_DOCS)}건을 초과했습니다.
          잘린 통계는 표시하지 않으므로 기간을 줄여주세요.
        </div>
      )}

      {!hasError && !isTruncated && !rangeResult.error && (
        <>
          <section className="grid grid-cols-4 gap-4">
            <SummaryCard
              label="총 클릭수"
              value={isLoading ? "-" : formatCount(aggregate.totalClicks)}
            />
            <SummaryCard
              label="클릭 배너 수"
              value={
                isLoading
                  ? "-"
                  : `${numberFormatter.format(aggregate.clickedBannerCount)}개`
              }
            />
            <SummaryCard
              label="기간 일평균 클릭수"
              value={
                isLoading
                  ? "-"
                  : `${(aggregate.totalClicks / dayCount).toFixed(1)}회/일`
              }
              description={`${dayCount}일 기준`}
            />
            <SummaryCard
              label="이전 동일 기간 대비"
              value={
                !previousRange ||
                comparisonUnavailable ||
                changeRate === undefined
                  ? "-"
                  : `${changeRate >= 0 ? "+" : ""}${changeRate.toFixed(1)}%`
              }
              description={
                comparisonUnavailable
                  ? "이전 기간을 불러오지 못했거나 조회 상한을 초과했습니다."
                  : "클릭수 증감이며 CTR이 아닙니다."
              }
            />
          </section>

          <section className="grid grid-cols-[minmax(0,2fr)_minmax(280px,1fr)] gap-4">
            <div className="rounded-10 border bg-white p-5">
              <h2 className="mb-4 text-lg font-semibold text-foreground-strong">
                일별 클릭 추이
              </h2>
              <BannerClickTrendChart
                dateKeys={dateKeys}
                series={[
                  {
                    label: "전체 클릭",
                    color: "#65558f",
                    values: aggregate.byDay,
                  },
                ]}
              />
            </div>
            <div className="rounded-10 border bg-white p-5">
              <h2 className="mb-4 text-lg font-semibold text-foreground-strong">
                위치별 클릭수
              </h2>
              <div className="space-y-4">
                {nonEmptyPlacementEntries.map(([id, clicks]) => {
                  const share = aggregate.totalClicks
                    ? (clicks / aggregate.totalClicks) * 100
                    : 0;
                  return (
                    <div key={id}>
                      <div className="mb-1 flex justify-between gap-3 text-sm">
                        <span>{BANNER_CLICK_PLACEMENT_LABELS[id]}</span>
                        <span>
                          {formatCount(clicks)} · {share.toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-background-label">
                        <div
                          className="h-full rounded-full bg-primary-foreground"
                          style={{ width: `${share}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                {!nonEmptyPlacementEntries.length && (
                  <p className="text-sm text-muted-foreground">
                    표시할 클릭 데이터가 없습니다.
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className="rounded-10 border bg-white p-5">
            <h2 className="mb-4 text-lg font-semibold text-foreground-strong">
              배너별 클릭수
            </h2>
            <div className="overflow-x-auto">
              <div className="min-w-[960px]">
                <CommonTable data={paginatedRows} columns={columns} />
              </div>
            </div>
            {!rows.length && placementId === "designer_home_carousel" && (
              <p className="mt-3 text-center text-sm text-muted-foreground">
                디자이너 홈 위치는 V2 스키마가 적용된 앱 클릭부터 구분됩니다.
                이전 앱의 디자이너 일반 클릭은 위치 미확인으로 집계됩니다.
              </p>
            )}
            <CommonPagination
              currentPage={tablePage}
              pageSize={tablePageSize}
              totalCount={rows.length}
              onPageChange={setTablePage}
              onSizeChange={(size) => {
                setTablePageSize(size);
                setTablePage(1);
              }}
            />
          </section>

          <section className="rounded-10 border bg-white p-5">
            <h2 className="mb-1 text-lg font-semibold text-foreground-strong">
              배너 비교
            </h2>
            <p className="mb-4 text-sm text-muted-foreground">
              첫 배너를 고르면 같은 위치의 다른 배너만 비교 대상으로 표시합니다.
            </p>
            <div className="mb-5 grid grid-cols-2 gap-4">
              <select
                aria-label="첫 번째 비교 배너"
                className="h-10 rounded-md border bg-white px-3"
                value={firstCompareBannerId}
                onChange={(event) => {
                  setFirstCompareBannerId(event.target.value);
                  setSecondCompareBannerId("");
                }}
              >
                <option value="">첫 배너를 선택하세요</option>
                {rows.map((row) => (
                  <option key={row.bannerId} value={row.bannerId}>
                    ID {row.bannerId} · {row.placementLabel} ·{" "}
                    {formatCount(row.clicks)}
                  </option>
                ))}
              </select>
              <select
                aria-label="두 번째 비교 배너"
                className="h-10 rounded-md border bg-white px-3 disabled:bg-background-label"
                value={secondCompareBannerId}
                disabled={!firstCompareRow}
                onChange={(event) =>
                  setSecondCompareBannerId(event.target.value)
                }
              >
                <option value="">
                  {firstCompareRow
                    ? "같은 위치의 배너를 선택하세요"
                    : "첫 배너를 먼저 선택하세요"}
                </option>
                {secondCompareCandidates.map((row) => (
                  <option key={row.bannerId} value={row.bannerId}>
                    ID {row.bannerId} · {row.placementLabel} ·{" "}
                    {formatCount(row.clicks)}
                  </option>
                ))}
              </select>
            </div>
            {firstCompareRow && secondCompareRow ? (
              <>
                <div className="mb-5 grid grid-cols-2 gap-4">
                  {[firstCompareRow, secondCompareRow].map((row) => (
                    <div
                      key={row.bannerId}
                      className="rounded-10 bg-background-label p-4"
                    >
                      <p className="font-semibold">배너 ID {row.bannerId}</p>
                      <p className="mt-2 text-2xl font-bold">
                        {formatCount(row.clicks)}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {row.averageDailyClicks.toFixed(1)}회/일
                        {periodPreset === "all" && row.averageDayCount
                          ? ` · ${row.averageDayCount}일`
                          : ""}{" "}
                        · {row.placementLabel}
                      </p>
                    </div>
                  ))}
                </div>
                <BannerClickTrendChart
                  dateKeys={dateKeys}
                  series={[
                    {
                      label: `배너 ${firstCompareRow.bannerId}`,
                      color: "#65558f",
                      values: firstCompareRow.dailyClicks,
                    },
                    {
                      label: `배너 ${secondCompareRow.bannerId}`,
                      color: "#375ce0",
                      values: secondCompareRow.dailyClicks,
                    },
                  ]}
                />
              </>
            ) : (
              <p className="py-8 text-center text-muted-foreground">
                비교할 배너 두 개를 선택해주세요.
              </p>
            )}
          </section>

          {(clicksQuery.data?.invalidDocumentCount ?? 0) > 0 && (
            <p className="text-xs text-muted-foreground">
              유효한 clickedAt 또는 bannerId가 없어 제외된 문서:{" "}
              {clicksQuery.data?.invalidDocumentCount}건
            </p>
          )}
        </>
      )}
    </div>
  );
}
