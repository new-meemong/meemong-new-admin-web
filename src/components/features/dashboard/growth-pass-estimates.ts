import type { LegacyMongDetailsResponse } from "@/apis/dashboards/types";

const DAY_MS = 86400000;
const DEFAULT_DURATIONS = [30, 90, 60, 7, 3, 120, 150, 180];

/** 참고 화면과 같은 구매일 + 이용기간 추정. 고유 인원/실제 활성 이력이 아닙니다. */
export function growthPassEstimates(
  response: Pick<LegacyMongDetailsResponse, "meta"> & {
    dataList: Pick<
      LegacyMongDetailsResponse["dataList"][number],
      "dateKST" | "usedCountByType"
    >[];
  },
) {
  const start = Date.parse(
    `${response.meta.startDateKST.slice(0, 10)}T00:00:00Z`,
  );
  const end = Date.parse(`${response.meta.endDateKST.slice(0, 10)}T00:00:00Z`);
  const durations = new Set(DEFAULT_DURATIONS);
  const purchases = response.dataList.flatMap((day) =>
    Object.entries(day.usedCountByType).flatMap(([label, count]) => {
      const match = /^\[디자이너\]\s*성장패스\s*(\d+)\s*일$/.exec(label);
      if (!match || Number(match[1]) <= 0) return [];
      const duration = Number(match[1]);
      durations.add(duration);
      return [
        { date: Date.parse(`${day.dateKST}T00:00:00Z`), duration, count },
      ];
    }),
  );
  const series: ({ dateKST: string; total: number } & Record<
    string,
    string | number
  >)[] = [];
  // 기록 없는 날도 포함해야 달력 날짜 기준으로 만료됩니다.
  for (let date = start; date < end; date += DAY_MS) {
    const point: (typeof series)[number] = {
      dateKST: new Date(date).toISOString().slice(0, 10),
      total: 0,
    };
    durations.forEach((duration) => {
      point[`days${duration}`] = 0;
    });
    for (const purchase of purchases) {
      if (
        purchase.date <= date &&
        date < purchase.date + purchase.duration * DAY_MS
      ) {
        point[`days${purchase.duration}`] =
          Number(point[`days${purchase.duration}`]) + purchase.count;
        point.total += purchase.count;
      }
    }
    series.push(point);
  }
  return { series, durations: [...durations] };
}
