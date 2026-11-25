"use client";

import React, { useState } from "react";
import { toast } from "react-toastify";

import {
  BRAND_RECOMMENDATION_FIELD,
  BRAND_RECOMMENDATION_SWITCH_CLASS,
  BrandRecommendationKind,
  BrandRecommendationStatus,
  brandRecommendationStatusLabel,
  formatBrandRecommendation,
} from "@/components/features/brand/brand-recommendation-field";
import { Switch } from "@/components/ui/switch";
import { IBrand } from "@/models/brand";
import { usePatchBrandMutation } from "@/queries/brands";

interface BrandRecommendationToggleProps {
  brand: IBrand;
  kind: BrandRecommendationKind;
  /** 목록 재조회 Promise를 돌려주면 끝날 때까지 요청한 값을 유지한다. */
  onChanged: () => unknown;
}

export default function BrandRecommendationToggle({
  brand,
  kind,
  onChanged,
}: BrandRecommendationToggleProps) {
  const patchBrandMutation = usePatchBrandMutation();
  const field = BRAND_RECOMMENDATION_FIELD[kind];
  const statusLabel = brandRecommendationStatusLabel(kind);
  // 저장·재조회 중에는 요청한 값을, 끝나면 다시 조회한 서버 값을 보여 준다.
  const [pendingValue, setPendingValue] = useState<boolean | null>(null);
  const checked = pendingValue ?? brand[field];

  const isSaving = pendingValue !== null;

  const handleChange = async (next: boolean) => {
    // 이전 저장·재조회가 끝나기 전의 재클릭은 중복 PATCH와 값 깜빡임을 만든다.
    if (isSaving) return;
    setPendingValue(next);
    try {
      // 서버는 생략한 추천 필드를 유지하므로 바꾼 필드 하나만 보낸다.
      await patchBrandMutation.mutateAsync({ id: brand.id, [field]: next });
      toast.success(
        `${brand.name} ${statusLabel}를 ${formatBrandRecommendation(next)}으로 변경했습니다.`,
      );
      await onChanged();
    } catch (error: unknown) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "잠시 후 다시 시도해주세요.",
      );
    } finally {
      setPendingValue(null);
    }
  };

  return (
    // 목록 행 클릭(상세 열기)으로 번지지 않게 토글 영역의 클릭을 여기서 멈춘다.
    <div
      className="flex items-center gap-2"
      onClick={(event) => event.stopPropagation()}
    >
      <BrandRecommendationStatus checked={checked} />
      <Switch
        checked={checked}
        onCheckedChange={handleChange}
        disabled={isSaving}
        className={BRAND_RECOMMENDATION_SWITCH_CLASS}
        aria-label={`${brand.name} ${statusLabel}`}
      />
    </div>
  );
}
