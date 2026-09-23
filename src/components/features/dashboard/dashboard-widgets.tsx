"use client";
import type { ReactNode } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import { Button } from "@/components/ui/button";
import { formatNumber, type RankingRow } from "./statistics";

export function Panel({
  title,
  description,
  children,
  action,
  className = "",
}: {
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <section className={`dashboard-panel ${className}`}>
      <div className="dashboard-panel-heading">
        <div>
          <h2>{title}</h2>
          {description && <p>{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
export function Metric({
  label,
  value,
  detail,
  color = "#007aff",
}: {
  label: string;
  value: string;
  detail?: string;
  color?: string;
}) {
  return (
    <div className="dashboard-metric">
      <div className="dashboard-metric-label">
        <span style={{ background: color }} />
        {label}
      </div>
      <strong>{value}</strong>
      {detail && <p>{detail}</p>}
    </div>
  );
}
export function Segments<T extends string>({
  label,
  value,
  options,
  onChange,
  disabled = false,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  disabled?: boolean;
}) {
  return (
    <div className="dashboard-segments" role="group" aria-label={label}>
      {options.map((option) => (
        <Button
          key={option.value}
          type="button"
          variant="ghost"
          aria-pressed={value === option.value}
          disabled={disabled}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}
export function QueryState({
  query,
  children,
}: {
  query: {
    isPending: boolean;
    isError: boolean;
    error: Error | null;
    refetch: () => unknown;
  };
  children: ReactNode;
}) {
  if (query.isError)
    return (
      <div className="dashboard-state" role="alert">
        <p>{query.error?.message || "데이터를 불러오지 못했습니다."}</p>
        <Button variant="outline" onClick={() => query.refetch()}>
          다시 시도
        </Button>
      </div>
    );
  if (query.isPending)
    return (
      <div className="dashboard-state" role="status">
        데이터를 불러오는 중…
      </div>
    );
  return <>{children}</>;
}
const compact = (value: number) =>
  new Intl.NumberFormat("ko-KR", { notation: "compact" }).format(value);
export function TrendChart({
  data,
  lines,
  height = 280,
}: {
  data: object[];
  lines: { key: string; label: string; color: string; right?: boolean }[];
  height?: number;
}) {
  if (!data.length)
    return <div className="dashboard-state">조회된 데이터가 없습니다.</div>;
  return (
    <div
      style={{ height }}
      aria-label={lines.map((line) => line.label).join(" · ")}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 16, right: 8, bottom: 4, left: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#e9e9eb"
          />
          <XAxis
            dataKey="dateKST"
            tickFormatter={(value) => String(value).slice(5).replace("-", ".")}
            tickLine={false}
            axisLine={false}
            minTickGap={30}
            fontSize={11}
          />
          <YAxis
            yAxisId="left"
            tickFormatter={compact}
            tickLine={false}
            axisLine={false}
            width={48}
            fontSize={11}
          />
          {lines.some((line) => line.right) && (
            <YAxis
              yAxisId="right"
              orientation="right"
              tickFormatter={compact}
              axisLine={false}
              tickLine={false}
              width={40}
              fontSize={11}
            />
          )}
          <Tooltip
            formatter={(value) =>
              formatNumber(typeof value === "number" ? value : null)
            }
            contentStyle={{ borderRadius: 12, border: "1px solid #eee" }}
          />
          <Legend
            align="left"
            iconType="plainline"
            wrapperStyle={{ fontSize: 12, paddingTop: 16 }}
          />
          {lines.map((line) => (
            <Line
              key={line.key}
              yAxisId={line.right ? "right" : "left"}
              dataKey={line.key}
              name={line.label}
              stroke={line.color}
              type="monotone"
              strokeWidth={line.key === "charged" ? 1.3 : 2}
              dot={data.length === 1}
              connectNulls={false}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
export function DistributionChart({
  rows,
  color = "#007aff",
}: {
  rows: RankingRow[];
  color?: string;
}) {
  if (!rows.length)
    return <div className="dashboard-state">조회된 데이터가 없습니다.</div>;
  return (
    <div className="dashboard-distribution">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={rows} margin={{ top: 12, bottom: 55 }}>
          <CartesianGrid
            vertical={false}
            strokeDasharray="3 3"
            stroke="#e9e9eb"
          />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            fontSize={10}
            angle={-35}
            textAnchor="end"
            interval={0}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            fontSize={11}
            width={40}
            allowDecimals={false}
          />
          <Tooltip
            formatter={(value) =>
              formatNumber(typeof value === "number" ? value : null)
            }
          />
          <Bar
            dataKey="value"
            name="건수"
            fill={color}
            radius={[4, 4, 0, 0]}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
export function Ranking({
  rows,
  unit = "건",
  color = "#007aff",
  limit,
}: {
  rows: RankingRow[];
  unit?: string;
  color?: string;
  limit?: number;
}) {
  const sorted = [...rows]
    .filter((row) => row.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
  const max = sorted[0]?.value || 1;
  return !sorted.length ? (
    <div className="dashboard-state">해당 데이터가 없습니다.</div>
  ) : (
    <ul className="dashboard-ranking">
      {sorted.map((row) => (
        <li key={row.id ?? row.label}>
          <div>
            <span>
              {row.label}
              {row.detail && (
                <small className="dashboard-code-detail">{row.detail}</small>
              )}
            </span>
            <strong>
              {formatNumber(row.value, unit)}
              {row.count !== undefined && (
                <small> / {formatNumber(row.count, "회")}</small>
              )}
            </strong>
          </div>
          <div className="dashboard-bar-track">
            <span
              style={{
                width: `${(row.value / max) * 100}%`,
                background: color,
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
// 참고 대시보드의 --chart-1 ~ --chart-4 색상입니다.
export const FUNNEL_COLORS = {
  blue: "lab(49.9074% 2.98011 -63.822)",
  sky: "lab(75.0934% -27.8279 -28.3918)",
  green: "lab(69.6529% -51.4113 33.9912)",
  orange: "lab(71.557% 32.2224 66.5953)",
};

export function Funnel({
  rows,
  rateBasis = "previous",
}: {
  rows: (RankingRow & { color: string })[];
  rateBasis?: "previous" | "first";
}) {
  const max = Math.max(...rows.map((row) => row.value), 1);
  return (
    <ol className="dashboard-funnel">
      {rows.map((row, index) => (
        <li key={row.label}>
          <div>
            <span>{row.label}</span>
            <strong>
              {formatNumber(row.value)}{" "}
              {index > 0 && (
                <small>
                  {rateBasis === "first" ? "전체 응답 대비" : "전환"}{" "}
                  {rows[rateBasis === "first" ? 0 : index - 1].value
                    ? `${((row.value / rows[rateBasis === "first" ? 0 : index - 1].value) * 100).toFixed(1)}%`
                    : "—"}
                </small>
              )}
            </strong>
          </div>
          <div className="dashboard-bar-track">
            <span
              style={{
                width: `${(row.value / max) * 100}%`,
                background: row.color,
              }}
            />
          </div>
        </li>
      ))}
    </ol>
  );
}
