"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import SalonPickProductFormModal from "@/components/features/salon-pick-products/salon-pick-product-form-modal";
import { cn } from "@/lib/utils";
import { useModal } from "@/components/shared/modal/useModal";

interface SalonPickProductsSearchFormProps {
  className?: string;
  onRefresh: () => void;
}

export default function SalonPickProductsSearchForm({
  className,
  onRefresh,
}: SalonPickProductsSearchFormProps) {
  const modal = useModal();

  return (
    <div className={cn("flex w-full items-center justify-between", className)}>
      <Button
        variant="outline"
        className="h-[43px] w-[142px] rounded-10 border-primary-foreground bg-white typo-body-2-long-bold text-foreground-strong hover:bg-white"
      >
        메인
      </Button>
      <Button
        variant="default"
        className="h-[38px] rounded-6 bg-button-submit-modal-background typo-body-2-semibold text-white"
        onClick={() => modal.open()}
      >
        + 신규 슬롯 생성
      </Button>
      <SalonPickProductFormModal
        isOpen={modal.isOpen}
        onClose={modal.close}
        onSubmit={onRefresh}
      />
    </div>
  );
}
