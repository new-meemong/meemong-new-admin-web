"use client";
import { useState } from "react";
import { useDashboardLegacyMongDetails } from "@/queries/dashboards";
import { growthPassEstimates } from "./growth-pass-estimates";
import { formatNumber } from "./statistics";
import { Panel, QueryState, Segments, TrendChart } from "./dashboard-widgets";

const COLORS = [
  "#eab308",
  "#3b82f6",
  "#22c55e",
  "#f97316",
  "#ef4444",
  "#a855f7",
  "#818cf8",
  "#6b7280",
];
export default function GrowthPassEstimateTrend() {
  const query = useDashboardLegacyMongDetails();
  const [period, setPeriod] = useState("all");
  const { series, durations } = query.data
    ? growthPassEstimates(query.data)
    : { series: [], durations: [] };
  const visible = period === "all" ? series : series.slice(-Number(period));
  const latest = series.at(-1);
  return (
    <Panel
      title="성장패스 활성 추이 (추정)"
      description={`디자이너 구매 기준 · ${latest?.dateKST ?? "최신 일자"} 활성 추정 ${formatNumber(latest?.total, "건")}`}
      action={
        <Segments
          label="성장패스 추이 기간"
          value={period}
          onChange={setPeriod}
          options={[
            { value: "all", label: "전체" },
            { value: "30", label: "30일" },
            { value: "7", label: "7일" },
          ]}
        />
      }
    >
      <QueryState query={query}>
        <TrendChart
          height={340}
          data={visible}
          lines={[
            { key: "total", label: "전체", color: "#1d1d1f" },
            ...durations.map((duration, index) => ({
              key: `days${duration}`,
              label: `성장패스 ${duration}일`,
              color: COLORS[index % COLORS.length],
            })),
          ]}
        />
        <p className="dashboard-note">
          {series[0]?.dateKST} ~ {latest?.dateKST} 구매 건수에 이용기간을 적용한
          추정치입니다. 중복 구매·환불·이용 시작일 차이와 조회 시작일 이전
          구매는 반영하지 않아 실제 활성 인원과 다를 수 있습니다. 상단 조회
          기간과 별도로 최근 한 달을 조회합니다.
        </p>
      </QueryState>
    </Panel>
  );
}
