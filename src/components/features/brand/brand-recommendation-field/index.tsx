"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface BrandRecommendationFieldProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export default function BrandRecommendationField({
  id,
  checked,
  onChange,
  disabled,
}: BrandRecommendationFieldProps) {
  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor={id}>추천 브랜드</Label>
        <Switch
          id={id}
          checked={checked}
          onCheckedChange={onChange}
          disabled={disabled}
          aria-describedby={`${id}-description`}
        />
        <span className="text-sm font-medium text-foreground-strong">
          {checked ? "추천" : "미추천"}
        </span>
      </div>
      <p
        id={`${id}-description`}
        className="rounded-md bg-background-label p-3 text-sm leading-6 text-foreground-strong"
      >
        연결된 디자이너가 가입일·공고 수정일과 관계없이 홈 추천 후보에
        포함됩니다. 거리·공통 노출 제한은 유지되며 최근접속순으로 정렬됩니다.
        변경은 다음 홈 목록 조회부터 반영됩니다.
      </p>
    </div>
  );
}
