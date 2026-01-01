"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useModal } from "@/components/shared/modal/useModal";
import BrandFormModal from "@/components/features/brand/brand-form-modal";

interface BrandSearchFormProps {
  className?: string;
  onRefresh: () => void;
}

function BrandSearchForm({ className, onRefresh }: BrandSearchFormProps) {
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
        브랜드 추가하기
      </Button>
      <BrandFormModal
        isOpen={modal.isOpen}
        onClose={modal.close}
        onSubmit={() => {
          onRefresh();
        }}
      />
    </div>
  );
}

export default BrandSearchForm;


