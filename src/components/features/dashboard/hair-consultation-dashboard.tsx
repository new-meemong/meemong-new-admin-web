"use client";
import { useState } from "react";
import type {
  DashboardDateRange,
  V3HairConsultationDay,
} from "@/apis/dashboards/types";
import {
  useDashboardHairConsultationSummary,
  useDashboardHairConsultations,
} from "@/queries/dashboards";
import {
  Metric,
  Panel,
  QueryState,
  Segments,
  TrendChart,
} from "./dashboard-widgets";
import {
  ConsultationRatePanel,
  ConsultationRatingPanel,
  rateText,
} from "./consultation-summary-panels";
import { ascending, dayCount, formatNumber, kstToday } from "./statistics";
import {
  dayLabel,
  dayColorClass,
  krwAmountText,
  krwSummary,
  previousRange,
  signed,
} from "./krw-payments";

const sum = <T,>(rows: T[], pick: (row: T) => number) =>
  rows.reduce((total, row) => total + pick(row), 0);

/** 일별 응답을 기간 합계로 묶습니다. 답변 수는 제출일 기준 일별 합계입니다. */
export function hairConsultationTotals(days: V3HairConsultationDay[]) {
  const deep = days.map((day) => day.deepStatistics);
  const quick = days.map((day) => day.quickStatistics);
  const deepCreated = sum(deep, (row) => row.createdConsultationCount);
  const quickCreated = sum(quick, (row) => row.createdConsultationCount);
  const deepAnswers = sum(deep, (row) => row.createdAnswerCount);
  const quickAnswers = sum(quick, (row) => row.createdAnswerCount);
  const deepMong = sum(deep, (row) => row.mongPayment.totalUsedMongAmount);
  const quickMong = sum(quick, (row) => row.mongPayment.totalUsedMongAmount);
  return {
    deepCreated,
    quickCreated,
    created: deepCreated + quickCreated,
    deepAnswers,
    quickAnswers,
    answers: deepAnswers + quickAnswers,
    store: krwSummary(deep.map((row) => row.storePayment)),
    deepMongCount: sum(deep, (row) => row.mongPayment.purchaseCount),
    quickMongCount: sum(quick, (row) => row.mongPayment.purchaseCount),
    deepMong,
    quickMong,
    mong: deepMong + quickMong,
  };
}

export default function HairConsultationDashboard({
  range,
}: {
  range: DashboardDateRange;
}) {
  const previous = previousRange(range);
  const daily = useDashboardHairConsultations(range);
  const previousDaily = useDashboardHairConsultations(previous);
  const summary = useDashboardHairConsultationSummary(range);
  const [activity, setActivity] = useState<"all" | "deep" | "quick">("all");
  const days = ascending(daily.data?.dataList ?? []);
  const current = hairConsultationTotals(days);
  const before = previousDaily.data
    ? hairConsultationTotals(previousDaily.data.dataList)
    : null;
  const periodLabel = `직전 ${formatNumber(dayCount(range), "일")} 대비`;
  const compare = (
    value: number,
    previousValue: number | undefined,
    unit: string,
  ) =>
    previousDaily.isError
      ? `${periodLabel} 비교 불가`
      : previousValue === undefined
        ? `${periodLabel} 불러오는 중`
        : `${periodLabel} ${signed(value - previousValue, unit)}`;
  const today = kstToday();
  const deepSummary = summary.data?.data.deepStatistics;
  const rating = deepSummary?.rating;
  const quickSummary = summary.data?.data.quickStatistics;
  const updatedAt = daily.dataUpdatedAt
    ? new Intl.DateTimeFormat("ko-KR", {
        timeZone: "Asia/Seoul",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(daily.dataUpdatedAt)
    : null;
  return (
    <div className="dashboard-sections hair-consultation-dashboard">
      <QueryState query={daily}>
        <div className="dashboard-metrics four">
          <Metric
            label="상담 생성"
            markerSrc="/dashboard/consultation-created.svg"
            color="#1d1d1f"
            value={formatNumber(current.created, "건")}
            detail={[
              compare(current.created, before?.created, "건"),
              `심층 ${formatNumber(current.deepCreated)} · 간편 ${formatNumber(current.quickCreated)}`,
            ]}
          />
          <Metric
            label="답변"
            markerSrc="/dashboard/consultation-answers.svg"
            value={formatNumber(current.answers, "건")}
            detail={[
              compare(current.answers, before?.answers, "건"),
              `심층 ${formatNumber(current.deepAnswers)} · 간편 ${formatNumber(current.quickAnswers)}`,
            ]}
          />
          <Metric
            label="단건결제액"
            markerSrc="/dashboard/consultation-payment.svg"
            value={krwAmountText(current.store)}
            color="#c2410c"
            badges={
              current.store.amountState === "partial"
                ? [
                    `확인 불가 ${formatNumber(current.store.unknownAmountCount, "건")}`,
                  ]
                : []
            }
            detail={[
              compare(
                current.store.knownAmount,
                before?.store.knownAmount,
                "원",
              ),
              `심층답변 열기 ${formatNumber(current.store.purchaseCount, "건")} · 환불 ${formatNumber(current.store.knownRefundedCount, "건")}`,
            ]}
          />
          <Metric
            label="몽 사용량"
            markerSrc="/dashboard/consultation-mong.svg"
            value={formatNumber(current.mong, "몽")}
            color="#003d82"
            detail={[
              compare(current.mong, before?.mong, "몽"),
              `고객 심층답변 열기 ${formatNumber(current.deepMong)} · 디자이너 간편 답변 ${formatNumber(current.quickMong)} · 매출과 합산하지 않음`,
            ]}
          />
        </div>
      </QueryState>
      <QueryState query={summary}>
        <p className="dashboard-note">
          기간 요약은 선택 기간에 생성된 상담 기준입니다. 이전 상담의 답변도
          포함하는 일별 답변 합계와 다를 수 있습니다.
        </p>
        <div className="dashboard-grid">
          <ConsultationRatePanel
            title="심층상담 답변률"
            description="생성된 상담 중 종료일까지 답변 1개 이상"
            createdLabel="심층상담 생성"
            completedLabel="답변 받은 상담"
            remainingLabel="미답변"
            total={deepSummary?.createdConsultationCount}
            completed={deepSummary?.answeredConsultationCount}
            rate={deepSummary?.answerRate}
          >
            <p className="text-sm text-gray-500 mt-4">
              기간 내 생성 상담의 총 답변 수{" "}
              <strong>{formatNumber(deepSummary?.answerCount, "건")}</strong> ·
              종료일까지 등록된 답변 기준
            </p>
          </ConsultationRatePanel>
          <ConsultationRatePanel
            title="간편상담 답변률"
            description="생성된 상담 중 종료일까지 답변 1개 이상"
            createdLabel="간편상담 생성"
            completedLabel="답변 받은 상담"
            remainingLabel="미답변"
            total={quickSummary?.createdConsultationCount}
            completed={quickSummary?.answeredConsultationCount}
            rate={quickSummary?.answerRate}
          >
            <p className="text-sm text-gray-500 mt-4">
              기간 내 생성 상담의 총 답변 수{" "}
              <strong>{formatNumber(quickSummary?.answerCount, "건")}</strong> ·
              종료일까지 등록된 답변 기준
            </p>
          </ConsultationRatePanel>
        </div>
        <div className="dashboard-grid">
          <ConsultationRatePanel
            title="심층상담 결제율"
            description="생성된 상담 중 답변 열기 결제"
            createdLabel="심층상담 생성"
            completedLabel="결제된 상담"
            remainingLabel="미결제"
            total={deepSummary?.createdConsultationCount}
            completed={deepSummary?.paidConsultationCount}
            rate={deepSummary?.paymentRate}
            color="#c2410c"
          />
          <ConsultationRatingPanel rating={rating} />
        </div>
      </QueryState>
      <QueryState query={daily}>
        <Panel
          title="상담 활동 추이"
          description={`생성 · 답변 · ${formatNumber(dayCount(range), "일")} 합계 생성 ${formatNumber(
            activity === "deep"
              ? current.deepCreated
              : activity === "quick"
                ? current.quickCreated
                : current.created,
          )} · 답변 ${formatNumber(
            activity === "deep"
              ? current.deepAnswers
              : activity === "quick"
                ? current.quickAnswers
                : current.answers,
          )}`}
          action={
            <Segments
              label="상담 유형"
              value={activity}
              onChange={setActivity}
              options={[
                { value: "all", label: "전체" },
                { value: "deep", label: "심층상담" },
                { value: "quick", label: "간편상담" },
              ]}
            />
          }
        >
          <TrendChart
            data={days.map((day) => {
              const deep = day.deepStatistics;
              const quick = day.quickStatistics;
              return {
                dateKST: day.dateKST,
                created:
                  (activity !== "quick" ? deep.createdConsultationCount : 0) +
                  (activity !== "deep" ? quick.createdConsultationCount : 0),
                answers:
                  (activity !== "quick" ? deep.createdAnswerCount : 0) +
                  (activity !== "deep" ? quick.createdAnswerCount : 0),
              };
            })}
            lines={[
              { key: "created", label: "생성", color: "#86868b" },
              { key: "answers", label: "답변", color: "#007aff" },
            ]}
          />
        </Panel>
        <Panel
          title="심층답변 열람 · 고객"
          description={`결제 수단별 열람 건수 · 단건결제 ${formatNumber(current.store.purchaseCount, "건")} ${krwAmountText(current.store)} · 몽 결제 ${formatNumber(current.deepMongCount, "건")} ${formatNumber(current.deepMong, "몽")}`}
        >
          <TrendChart
            data={days.map((day) => ({
              dateKST: day.dateKST,
              store: day.deepStatistics.storePayment.purchaseCount,
              mong: day.deepStatistics.mongPayment.purchaseCount,
            }))}
            lines={[
              { key: "store", label: "단건결제", color: "#c2410c" },
              { key: "mong", label: "몽 결제", color: "#007aff" },
            ]}
            height={260}
          />
        </Panel>
        <Panel
          title="간편상담 답변 · 디자이너 몽 사용"
          description={`${formatNumber(current.quickMongCount, "건")} ${formatNumber(current.quickMong, "몽")}`}
        >
          <TrendChart
            data={days.map((day) => ({
              dateKST: day.dateKST,
              mong: day.quickStatistics.mongPayment.totalUsedMongAmount,
            }))}
            lines={[{ key: "mong", label: "몽 사용", color: "#003d82" }]}
            height={260}
          />
        </Panel>
        <Panel
          title="일별 상세"
          description={`최신순${range.endDateKST >= today ? " · 오늘은 집계 중" : ""}${updatedAt ? ` · 마지막 갱신 ${updatedAt}` : ""}`}
        >
          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>날짜</th>
                  <th>생성 심층</th>
                  <th>생성 간편</th>
                  <th>답변 심층</th>
                  <th>심층 답변률</th>
                  <th>답변 간편</th>
                  <th>간편 답변률</th>
                  <th>결제된 상담</th>
                  <th>단건결제액</th>
                  <th>몽 고객 열기</th>
                  <th>몽 디자이너 답변</th>
                </tr>
              </thead>
              <tbody>
                {[...days].reverse().map((day) => {
                  const deep = day.deepStatistics;
                  const quick = day.quickStatistics;
                  const store = krwSummary([deep.storePayment]);
                  return (
                    <tr key={day.dateKST}>
                      <td className={dayColorClass(day.dateKST)}>
                        {dayLabel(day.dateKST)}
                        {day.dateKST === today && (
                          <em className="dashboard-badge neutral">집계 중</em>
                        )}
                      </td>
                      <td>{formatNumber(deep.createdConsultationCount)}</td>
                      <td>{formatNumber(quick.createdConsultationCount)}</td>
                      <td>{formatNumber(deep.createdAnswerCount)}</td>
                      <td title="일별 답변률 데이터 미제공">—</td>
                      <td>{formatNumber(quick.createdAnswerCount)}</td>
                      <td title="일별 답변률 데이터 미제공">—</td>
                      <td>{formatNumber(deep.paidConsultationCount)}</td>
                      <td>
                        {store.purchaseCount ? krwAmountText(store) : "—"}
                      </td>
                      <td>
                        {deep.mongPayment.totalUsedMongAmount
                          ? formatNumber(
                              deep.mongPayment.totalUsedMongAmount,
                              "몽",
                            )
                          : "—"}
                      </td>
                      <td>
                        {quick.mongPayment.totalUsedMongAmount
                          ? formatNumber(
                              quick.mongPayment.totalUsedMongAmount,
                              "몽",
                            )
                          : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td>합계</td>
                  <td>{formatNumber(current.deepCreated)}</td>
                  <td>{formatNumber(current.quickCreated)}</td>
                  <td>{formatNumber(current.deepAnswers)}</td>
                  <td className="consultation-answer-rate">
                    {summary.isError ? "—" : rateText(deepSummary?.answerRate)}
                  </td>
                  <td>{formatNumber(current.quickAnswers)}</td>
                  <td className="consultation-answer-rate">
                    {summary.isError ? "—" : rateText(quickSummary?.answerRate)}
                  </td>
                  <td>
                    {formatNumber(
                      sum(
                        days,
                        (day) => day.deepStatistics.paidConsultationCount,
                      ),
                    )}
                  </td>
                  <td>{krwAmountText(current.store)}</td>
                  <td>{formatNumber(current.deepMong, "몽")}</td>
                  <td>{formatNumber(current.quickMong, "몽")}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Panel>
      </QueryState>
      <p className="dashboard-note">
        상담은 생성일, 답변은 작성일 기준입니다. 답변률은 기간 내 생성된 상담 중
        종료일까지 답변이 1개 이상 달린 비율이며, 답변 수 ÷ 생성 수로 계산하지
        않습니다. 일별 답변률은 데이터 미제공으로 표시하지 않습니다. 몽 사용량은
        매출이 아니며 합산하지 않습니다.
      </p>
    </div>
  );
}
