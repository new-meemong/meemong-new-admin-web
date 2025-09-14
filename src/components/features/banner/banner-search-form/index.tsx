"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useModal } from "@/components/shared/modal/useModal";
import BannerFormModal from "@/components/features/banner/banner-form-modal";

interface BannerSearchFormProps {
  className?: string;
  onRefresh: () => void;
}

function BannerSearchForm({ className, onRefresh }: BannerSearchFormProps) {
  const modal = useModal();

  return (
    <div
      className={cn(
        "w-full flex justify-end items-center pb-[12px]",
        className,
      )}
    >
      <Button
        variant={"outline"}
        className={cn(
          "border-secondary-background bg-secondary-background text-secondary-foreground hover:bg-secondary-background",
        )}
        onClick={() => modal.open()}
      >
        배너 교체하기
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
