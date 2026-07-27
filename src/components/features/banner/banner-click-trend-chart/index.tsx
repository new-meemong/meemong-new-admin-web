"use client";

import React from "react";

interface TrendSeries {
  label: string;
  color: string;
  values: Record<string, number>;
}

interface BannerClickTrendChartProps {
  dateKeys: string[];
  series: TrendSeries[];
}

const WIDTH = 960;
const HEIGHT = 260;
const PADDING_X = 42;
const PADDING_Y = 24;

function createPath(
  dateKeys: string[],
  values: Record<string, number>,
  max: number,
) {
  if (!dateKeys.length) return "";
  const width = WIDTH - PADDING_X * 2;
  const height = HEIGHT - PADDING_Y * 2;
  return dateKeys
    .map((dateKey, index) => {
      const x =
        dateKeys.length === 1
          ? WIDTH / 2
          : PADDING_X + (index / (dateKeys.length - 1)) * width;
      const y = PADDING_Y + height - ((values[dateKey] ?? 0) / max) * height;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

export default function BannerClickTrendChart({
  dateKeys,
  series,
}: BannerClickTrendChartProps) {
  const max = Math.max(
    1,
    ...series.flatMap((item) =>
      dateKeys.map((dateKey) => item.values[dateKey] ?? 0),
    ),
  );
  const labelStep = Math.max(1, Math.ceil(dateKeys.length / 6));
  const gridValues = [...new Set([max, Math.floor(max / 2), 0])];

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
          {dateKeys.map((dateKey, index) => {
            if (index % labelStep !== 0 && index !== dateKeys.length - 1) {
              return null;
            }
            const x =
              dateKeys.length === 1
                ? WIDTH / 2
                : PADDING_X +
                  (index / (dateKeys.length - 1)) * (WIDTH - PADDING_X * 2);
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
        </svg>
      </div>
    </div>
  );
}
