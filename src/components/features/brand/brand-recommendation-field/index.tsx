"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { IBrand } from "@/models/brand";
import { cn } from "@/lib/utils";

export type BrandRecommendationKind = "home" | "timeSale";

// 홈 추천(isRecommended)과 리뷰특가 추천(isTimeSaleRecommended)은 서버에서 독립된
// 플래그이므로 한쪽을 켜도 다른 노출면에는 영향이 없다는 점을 문구로 구분한다.
const RECOMMENDATION_COPY: Record<
  BrandRecommendationKind,
  { label: string; statusLabel: string; description: string }
> = {
  home: {
    label: "홈 추천 브랜드",
    statusLabel: "홈 추천 여부",
    description:
      "연결된 디자이너가 가입일·공고 수정일과 관계없이 홈 추천 후보에 포함됩니다. 거리·공통 노출 제한은 유지되며 최근접속순으로 정렬됩니다. 변경은 다음 홈 목록 조회부터 반영됩니다.",
  },
  timeSale: {
    label: "리뷰특가 추천 브랜드",
    statusLabel: "리뷰특가 추천 여부",
    description:
      "연결된 디자이너의 리뷰특가 메뉴가 앱 리뷰특가 추천순 목록에 브랜드 추천으로 섞여 노출됩니다. 노출 위치와 후보 선정은 서버 기준을 따르며 홈 추천과는 별도로 적용됩니다. 변경은 다음 목록 조회부터 반영됩니다.",
  },
};

export const brandRecommendationStatusLabel = (kind: BrandRecommendationKind) =>
  RECOMMENDATION_COPY[kind].statusLabel;

export const BRAND_RECOMMENDATION_FIELD = {
  home: "isRecommended",
  timeSale: "isTimeSaleRecommended",
} as const satisfies Record<BrandRecommendationKind, keyof IBrand>;

// 공용 Switch의 미선택 배경은 진한 회색이라 추천(파랑)과 구분이 약해 브랜드 추천에서만 연하게 바꾼다.
export const BRAND_RECOMMENDATION_SWITCH_CLASS =
  "data-[state=unchecked]:bg-gray-300";

export const formatBrandRecommendation = (checked: boolean) =>
  checked ? "추천" : "미추천";

export function BrandRecommendationStatus({ checked }: { checked: boolean }) {
  return (
    <span
      className={cn(
        // 글자 수가 달라도 옆 토글 위치가 같도록 "미추천" 폭으로 고정한다.
        "inline-block w-11 shrink-0 text-sm font-medium",
        checked ? "text-green-500" : "text-foreground-strong",
      )}
    >
      {formatBrandRecommendation(checked)}
    </span>
  );
}

interface BrandRecommendationFieldProps {
  id: string;
  kind: BrandRecommendationKind;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export default function BrandRecommendationField({
  id,
  kind,
  checked,
  onChange,
  disabled,
}: BrandRecommendationFieldProps) {
  const copy = RECOMMENDATION_COPY[kind];
  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor={id}>{copy.label}</Label>
        <Switch
          id={id}
          checked={checked}
          onCheckedChange={onChange}
          disabled={disabled}
          className={BRAND_RECOMMENDATION_SWITCH_CLASS}
          aria-describedby={`${id}-description`}
        />
        <BrandRecommendationStatus checked={checked} />
      </div>
      <p
        id={`${id}-description`}
        className="rounded-md bg-background-label p-3 text-sm leading-6 text-foreground-strong"
      >
        {copy.description}
      </p>
    </div>
  );
}
