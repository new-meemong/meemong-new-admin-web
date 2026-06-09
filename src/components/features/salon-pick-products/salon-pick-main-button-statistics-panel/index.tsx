"use client";

import React, { useMemo, useState } from "react";
import dayjs from "dayjs";
import {
  BarChart3,
  ChevronDown,
  ChevronUp,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ISalonPickMainButton } from "@/models/salonPickMainButtons";
import { useGetSalonPickMainButtonDetailQuery } from "@/queries/salonPickMainButtons";
import {
  getSalonPickMainButtonPreviousDayClickCount,
  getSalonPickMainButtonTotalClickCount,
  sortSalonPickMainButtonDailyClickCountsByDateDesc,
} from "@/utils/salonPickMainButtons";
import { cn } from "@/lib/utils";

interface SalonPickMainButtonStatisticsPanelProps {
  data: ISalonPickMainButton[];
  isLoading?: boolean;
  isFetching?: boolean;
  isError?: boolean;
  onRefresh: () => void;
  className?: string;
}

interface SalonPickMainButtonStatisticsRowProps {
  mainButton: ISalonPickMainButton;
  isOpen: boolean;
  onToggle: () => void;
}

function formatClickCount(value?: number | null) {
  return typeof value === "number" ? value.toLocaleString("ko-KR") : "-";
}

function formatDate(value?: string | null) {
  if (!value) return "-";

  const date = dayjs(value);
  return date.isValid() ? date.format("YYYY.MM.DD") : "-";
}

function formatDateTime(value?: string | null) {
  if (!value) return "-";

  const date = dayjs(value);
  return date.isValid() ? date.format("YYYY.MM.DD HH:mm") : "-";
}

function getSalonPickMainButtonCodeLabel(code?: string | null) {
  if (code === "MAIN_BUTTON") return "살롱픽 메인 버튼";

  return "메인 버튼";
}

function SalonPickMainButtonStatisticsSkeleton() {
  return (
    <div className="min-w-[760px] px-[16px] py-[14px]">
      <div className="grid grid-cols-[minmax(180px,1fr)_128px_128px_180px_112px] gap-[12px]">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={`main-button-statistics-skeleton-${index}`}
            className="h-[28px] animate-pulse rounded-4 bg-[#e8ebf3]"
          />
        ))}
      </div>
    </div>
  );
}

function SalonPickMainButtonStatisticsMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <p className="mb-[6px] text-[12px] font-medium leading-[130%] text-[#8c91a1]">
        {label}
      </p>
      <p className="truncate text-[18px] font-semibold leading-[130%] text-foreground-strong">
        {value}
      </p>
    </div>
  );
}

function SalonPickMainButtonDailyClickCounts({
  mainButton,
  isOpen,
}: {
  mainButton: ISalonPickMainButton;
  isOpen: boolean;
}) {
  const getSalonPickMainButtonDetailQuery =
    useGetSalonPickMainButtonDetailQuery(mainButton.id, {
      enabled: isOpen && mainButton.id > 0,
    });
  const detail = getSalonPickMainButtonDetailQuery.data;
  const dailyClickCounts = useMemo(
    () =>
      sortSalonPickMainButtonDailyClickCountsByDateDesc(
        detail?.dailyClickCounts ?? [],
      ),
    [detail?.dailyClickCounts],
  );

  if (getSalonPickMainButtonDetailQuery.isLoading) {
    return (
      <div className="flex h-[78px] items-center justify-center gap-[8px] text-[13px] text-[#6d7384]">
        <Loader2 className="h-4 w-4 animate-spin" />
        불러오는 중...
      </div>
    );
  }

  if (getSalonPickMainButtonDetailQuery.isError) {
    return (
      <div className="flex h-[78px] items-center justify-between gap-[12px] px-[16px] text-[13px] text-[#6d7384]">
        <span>일별 클릭수 내역을 불러오지 못했습니다.</span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-[30px] rounded-4 px-[10px] text-[12px]"
          onClick={() => getSalonPickMainButtonDetailQuery.refetch()}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          재시도
        </Button>
      </div>
    );
  }

  return (
    <div className="px-[16px] py-[14px]">
      <div className="overflow-hidden rounded-6 border bg-white">
        <div className="grid h-[34px] grid-cols-[140px_140px_180px] items-center bg-[#f3f5fc] px-[12px] text-[13px] font-semibold text-foreground-strong">
          <span>집계 날짜</span>
          <span>클릭수</span>
          <span>갱신 시각</span>
        </div>
        <div className="max-h-[260px] overflow-y-auto">
          {dailyClickCounts.length ? (
            dailyClickCounts.map((count) => (
              <div
                key={count.id}
                className="grid h-[32px] grid-cols-[140px_140px_180px] items-center border-t px-[12px] text-[13px] text-foreground"
              >
                <span>{formatDate(count.date)}</span>
                <span>{formatClickCount(count.dailyClickCount)}</span>
                <span>{formatDateTime(count.updatedAt)}</span>
              </div>
            ))
          ) : (
            <div className="border-t px-[12px] py-[14px] text-[13px] text-[#8c91a1]">
              일별 클릭수 내역이 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SalonPickMainButtonStatisticsRow({
  mainButton,
  isOpen,
  onToggle,
}: SalonPickMainButtonStatisticsRowProps) {
  const totalClickCount = getSalonPickMainButtonTotalClickCount(mainButton);
  const previousDayClickCount =
    getSalonPickMainButtonPreviousDayClickCount(mainButton);
  const detailId = `salon-pick-main-button-statistics-${mainButton.id}`;

  return (
    <div className="border-t first:border-t-0">
      <div className="grid min-h-[74px] min-w-[760px] grid-cols-[minmax(180px,1fr)_128px_128px_180px_112px] items-center gap-[12px] px-[16px] py-[12px]">
        <div className="min-w-0">
          <p className="truncate text-[14px] font-semibold leading-[130%] text-foreground-strong">
            {getSalonPickMainButtonCodeLabel(mainButton.code)}
          </p>
          <p className="mt-[6px] inline-flex max-w-full rounded-4 bg-[#eef2f8] px-[8px] py-[3px] text-[12px] font-medium leading-[130%] text-[#4b5263]">
            <span className="truncate">{mainButton.code || "-"}</span>
          </p>
        </div>
        <SalonPickMainButtonStatisticsMetric
          label="전체 클릭수"
          value={formatClickCount(totalClickCount)}
        />
        <SalonPickMainButtonStatisticsMetric
          label="전일 클릭수"
          value={formatClickCount(previousDayClickCount)}
        />
        <SalonPickMainButtonStatisticsMetric
          label="마지막 갱신"
          value={formatDateTime(mainButton.updatedAt)}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-expanded={isOpen}
          aria-controls={detailId}
          className="h-[32px] rounded-4 px-[10px] text-[12px]"
          onClick={onToggle}
        >
          {isOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
          일별 내역
        </Button>
      </div>
      {isOpen && (
        <div id={detailId} className="min-w-[760px] border-t bg-[#fafbff]">
          <SalonPickMainButtonDailyClickCounts
            mainButton={mainButton}
            isOpen={isOpen}
          />
        </div>
      )}
    </div>
  );
}

export default function SalonPickMainButtonStatisticsPanel({
  data,
  isLoading = false,
  isFetching = false,
  isError = false,
  onRefresh,
  className,
}: SalonPickMainButtonStatisticsPanelProps) {
  const [openMainButtonId, setOpenMainButtonId] = useState<number | null>(null);

  return (
    <section
      className={cn(
        "overflow-hidden rounded-10 border bg-white text-foreground",
        className,
      )}
    >
      <div className="flex min-h-[52px] items-center justify-between gap-[12px] border-b px-[16px] py-[10px]">
        <div className="flex min-w-0 items-center gap-[8px]">
          <BarChart3 className="h-4 w-4 shrink-0 text-[#2f72ff]" />
          <h2 className="truncate text-[15px] font-semibold leading-[130%] text-foreground-strong">
            메인 버튼 통계
          </h2>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isFetching}
          className="h-[32px] rounded-4 px-[10px] text-[12px]"
          onClick={onRefresh}
        >
          <RefreshCw
            className={cn("h-3.5 w-3.5", isFetching && "animate-spin")}
          />
          새로고침
        </Button>
      </div>
      <div className="overflow-x-auto">
        {isLoading ? (
          <SalonPickMainButtonStatisticsSkeleton />
        ) : isError ? (
          <div className="flex min-h-[74px] min-w-[760px] items-center justify-between gap-[12px] px-[16px] py-[14px] text-[13px] text-[#6d7384]">
            <span>메인 버튼 통계를 불러오지 못했습니다.</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-[30px] rounded-4 px-[10px] text-[12px]"
              onClick={onRefresh}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              재시도
            </Button>
          </div>
        ) : data.length ? (
          data.map((mainButton) => (
            <SalonPickMainButtonStatisticsRow
              key={mainButton.id}
              mainButton={mainButton}
              isOpen={openMainButtonId === mainButton.id}
              onToggle={() =>
                setOpenMainButtonId((currentId) =>
                  currentId === mainButton.id ? null : mainButton.id,
                )
              }
            />
          ))
        ) : (
          <div className="flex min-h-[74px] min-w-[760px] items-center px-[16px] py-[14px] text-[13px] text-[#8c91a1]">
            메인 버튼 통계가 없습니다.
          </div>
        )}
      </div>
    </section>
  );
}
