"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useModal } from "@/components/shared/modal/useModal";
import BannerFormModal from "@/components/features/banner/banner-form-modal";
import { Checkbox } from "@/components/ui/checkbox";

interface BannerSearchFormProps {
  className?: string;
  showActiveOnly: boolean;
  onShowActiveOnlyChange: (checked: boolean) => void;
  onRefresh: () => void;
}

function BannerSearchForm({
  className,
  showActiveOnly,
  onShowActiveOnlyChange,
  onRefresh,
}: BannerSearchFormProps) {
  const modal = useModal();

  return (
    <div
      className={cn(
        "w-full flex justify-between items-center pb-[12px]",
        className,
      )}
    >
      <label className="flex items-center gap-1.5 cursor-pointer select-none">
        <Checkbox
          checked={showActiveOnly}
          onCheckedChange={(checked) =>
            onShowActiveOnlyChange(checked === true)
          }
        />
        <span>활성화된 배너만 보기</span>
      </label>
      <Button
        variant={"outline"}
        className={cn(
          "border-secondary-background bg-secondary-background text-secondary-foreground hover:bg-secondary-background",
        )}
        onClick={() => modal.open()}
      >
        배너 추가하기
      </Button>
      <BannerFormModal
        isOpen={modal.isOpen}
        onClose={modal.close}
        onSubmit={() => {
          onRefresh();
        }}
      />
    </div>
  );
}

export default BannerSearchForm;
