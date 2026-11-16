import type { V3Rating } from "@/apis/dashboards/types";
import { Panel } from "./dashboard-widgets";
import { formatNumber } from "./statistics";

export const rateText = (rate: number | null | undefined) =>
  rate == null ? "—" : `${rate.toFixed(1)}%`;

/** 생성일 코호트의 답변률과 결제율에 공통으로 사용하는 구성입니다. */
export function ConsultationRatePanel({
  title,
  description,
  createdLabel,
  completedLabel,
  remainingLabel,
  total,
  completed,
  rate,
  color = "#007aff",
}: {
  title: string;
  description: string;
  createdLabel: string;
  completedLabel: string;
  remainingLabel: string;
  total?: number;
  completed?: number;
  rate?: number | null;
  color?: string;
}) {
  const remaining =
    total == null || completed == null
      ? undefined
      : Math.max(0, total - completed);
  const rows = [
    {
      label: createdLabel,
      value: total,
      rate: total ? 100 : null,
      color: "#1d1d1f",
    },
    { label: completedLabel, value: completed, rate, color },
    {
      label: remainingLabel,
      value: remaining,
      rate: rate == null ? null : 100 - rate,
      color: "#c7c7cc",
    },
  ];
  return (
    <Panel
      title={title}
      description={description}
      className="consultation-summary-panel"
      action={
        <strong className="consultation-summary-value" style={{ color }}>
          {rate == null ? (
            "—"
          ) : (
            <>
              {rate.toFixed(1)}
              <small>%</small>
            </>
          )}
        </strong>
      }
    >
      <ol className="consultation-rate-rows">
        {rows.map((row, index) => (
          <li key={row.label}>
            <div>
              <span>{row.label}</span>
              <strong>
                {formatNumber(row.value)}
                {index > 0 && <small>{rateText(row.rate)}</small>}
              </strong>
            </div>
            <div className="dashboard-bar-track">
              <span
                style={{
                  width: `${Math.min(100, Math.max(0, row.rate ?? 0))}%`,
                  background: row.color,
                }}
              />
            </div>
          </li>
        ))}
      </ol>
    </Panel>
  );
}

export function ConsultationRatingPanel({ rating }: { rating?: V3Rating }) {
  return (
    <Panel
      title="심층답변 평점"
      description={`종료일까지 평가된 답변 ${formatNumber(rating?.ratedAnswerCount, "건")} · 5점 만점`}
      className="consultation-summary-panel"
      action={
        <strong className="consultation-summary-value">
          {rating?.averageRating == null
            ? "—"
            : rating.averageRating.toFixed(2)}
          <small className="consultation-rating-unit">/ 5</small>
        </strong>
      }
    >
      <ul className="consultation-rating-rows">
        {[5, 4, 3, 2, 1].map((score) => {
          const count = rating
            ? (rating.ratingCountList.find((row) => row.rating === score)
                ?.count ?? 0)
            : undefined;
          const rate =
            rating?.ratedAnswerCount && count != null
              ? (count / rating.ratedAnswerCount) * 100
              : rating
                ? 0
                : null;
          return (
            <li key={score} className={count === 0 ? "empty" : undefined}>
              <span>{score}점</span>
              <div className="dashboard-bar-track">
                <span
                  style={{ width: `${rate ?? 0}%`, background: "#1d1d1f" }}
                />
              </div>
              <strong>
                {formatNumber(count, "건")}
                <small>{rateText(rate)}</small>
              </strong>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
