"use client";

import React, { useState } from "react";

interface TrendSeries {
  label: string;
  color: string;
  values: Record<string, number>;
}

interface TrendTooltipItem {
  label: string;
  values: Record<string, number>;
  color?: string;
  isSummary?: boolean;
}

interface BannerClickTrendChartProps {
  dateKeys: string[];
  series: TrendSeries[];
  tooltipItems?: TrendTooltipItem[];
}

const WIDTH = 960;
const HEIGHT = 260;
const PADDING_X = 42;
const PADDING_Y = 24;
const TOOLTIP_WIDTH = 280;
const TOOLTIP_HEIGHT = 244;
const countFormatter = new Intl.NumberFormat("ko-KR");

function getPointX(index: number, pointCount: number) {
  if (pointCount === 1) return WIDTH / 2;
  return PADDING_X + (index / (pointCount - 1)) * (WIDTH - PADDING_X * 2);
}

function getPointY(value: number, max: number) {
  const plotHeight = HEIGHT - PADDING_Y * 2;
  return PADDING_Y + plotHeight - (value / max) * plotHeight;
}

function createPath(
  dateKeys: string[],
  values: Record<string, number>,
  max: number,
) {
  if (!dateKeys.length) return "";
  return dateKeys
    .map((dateKey, index) => {
      const x = getPointX(index, dateKeys.length);
      const y = getPointY(values[dateKey] ?? 0, max);
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

export default function BannerClickTrendChart({
  dateKeys,
  series,
  tooltipItems,
}: BannerClickTrendChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number>();
  const max = Math.max(
    1,
    ...series.flatMap((item) =>
      dateKeys.map((dateKey) => item.values[dateKey] ?? 0),
    ),
  );
  const labelStep = Math.max(1, Math.ceil(dateKeys.length / 6));
  const gridValues = [...new Set([max, Math.floor(max / 2), 0])];
  const hoveredDateKey =
    hoveredIndex === undefined ? undefined : dateKeys[hoveredIndex];
  const hoveredX =
    hoveredIndex === undefined
      ? undefined
      : getPointX(hoveredIndex, dateKeys.length);
  const resolvedTooltipItems: TrendTooltipItem[] = tooltipItems ?? series;
  const tooltipRows = hoveredDateKey
    ? resolvedTooltipItems
        .map((item) => ({
          ...item,
          value: item.values[hoveredDateKey] ?? 0,
        }))
        .sort((a, b) => {
          if (a.isSummary !== b.isSummary) return a.isSummary ? -1 : 1;
          if (a.value !== b.value) return b.value - a.value;
          return a.label.localeCompare(b.label, "ko");
        })
    : [];
  const tooltipX =
    hoveredX === undefined
      ? 0
      : Math.min(
          WIDTH - TOOLTIP_WIDTH - 8,
          Math.max(
            8,
            hoveredX < WIDTH / 2
              ? hoveredX + 12
              : hoveredX - TOOLTIP_WIDTH - 12,
          ),
        );

  if (!dateKeys.length) {
    return (
      <div className="flex h-[260px] items-center justify-center text-muted-foreground">
        표시할 클릭 데이터가 없습니다.
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-4">
        {series.map((item) => (
          <div key={item.label} className="flex items-center gap-2 text-sm">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            {item.label}
          </div>
        ))}
      </div>
      <div className="overflow-x-auto">
        <svg
          role="img"
          aria-label="일별 배너 클릭수 추이"
          className="h-[260px] min-w-[720px] w-full overflow-visible"
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          preserveAspectRatio="xMidYMid meet"
          onMouseLeave={() => setHoveredIndex(undefined)}
        >
          {gridValues.map((value) => {
            const ratio = 1 - value / max;
            const y = PADDING_Y + (HEIGHT - PADDING_Y * 2) * ratio;
            return (
              <g key={value}>
                <line
                  x1={PADDING_X}
                  x2={WIDTH - PADDING_X}
                  y1={y}
                  y2={y}
                  stroke="#e5e5e5"
                  strokeWidth="1"
                />
                <text x="4" y={y + 4} fontSize="12" fill="#898886">
                  {value}
                </text>
              </g>
            );
          })}
          {series.map((item) => (
            <path
              key={item.label}
              d={createPath(dateKeys, item.values, max)}
              fill="none"
              stroke={item.color}
              strokeWidth="3"
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {hoveredDateKey && hoveredX !== undefined && (
            <g pointerEvents="none">
              <line
                x1={hoveredX}
                x2={hoveredX}
                y1={PADDING_Y}
                y2={HEIGHT - PADDING_Y}
                stroke="#898886"
                strokeDasharray="4 4"
                strokeWidth="1"
                vectorEffect="non-scaling-stroke"
              />
              {series.map((item) => (
                <circle
                  key={item.label}
                  cx={hoveredX}
                  cy={getPointY(item.values[hoveredDateKey] ?? 0, max)}
                  r="4"
                  fill="white"
                  stroke={item.color}
                  strokeWidth="3"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </g>
          )}
          {dateKeys.map((dateKey, index) => {
            if (index % labelStep !== 0 && index !== dateKeys.length - 1) {
              return null;
            }
            const x = getPointX(index, dateKeys.length);
            return (
              <text
                key={dateKey}
                x={x}
                y={HEIGHT - 2}
                textAnchor="middle"
                fontSize="11"
                fill="#898886"
              >
                {dateKey.slice(5)}
              </text>
            );
          })}
          {dateKeys.map((dateKey, index) => {
            const x = getPointX(index, dateKeys.length);
            const previousX =
              index === 0
                ? PADDING_X
                : (getPointX(index - 1, dateKeys.length) + x) / 2;
            const nextX =
              index === dateKeys.length - 1
                ? WIDTH - PADDING_X
                : (x + getPointX(index + 1, dateKeys.length)) / 2;
            return (
              <rect
                key={`hover-${dateKey}`}
                x={previousX}
                y={0}
                width={Math.max(1, nextX - previousX)}
                height={HEIGHT}
                fill="transparent"
                className="cursor-crosshair"
                onMouseEnter={() => setHoveredIndex(index)}
              />
            );
          })}
          {hoveredDateKey && hoveredX !== undefined && (
            <foreignObject
              x={tooltipX}
              y={8}
              width={TOOLTIP_WIDTH}
              height={TOOLTIP_HEIGHT}
            >
              <div className="max-h-[244px] overflow-y-auto rounded-lg border bg-white shadow-lg">
                <p className="sticky top-0 border-b bg-white px-3 py-2 text-sm font-semibold text-foreground-strong">
                  {hoveredDateKey} (KST)
                </p>
                <div className="space-y-1 p-2">
                  {tooltipRows.map((item, index) => (
                    <div
                      key={`${item.label}-${index}`}
                      className={`flex items-center justify-between gap-3 rounded px-1.5 py-1 text-xs ${
                        item.isSummary
                          ? "bg-background-label font-semibold"
                          : ""
                      }`}
                    >
                      <span className="flex min-w-0 items-center gap-1.5">
                        <span
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: item.color ?? "#898886" }}
                        />
                        <span className="truncate">{item.label}</span>
                      </span>
                      <span className="shrink-0">
                        {countFormatter.format(item.value)}회
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </foreignObject>
          )}
        </svg>
      </div>
    </div>
  );
}
