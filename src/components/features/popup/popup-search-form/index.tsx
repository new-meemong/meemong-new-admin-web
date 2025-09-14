"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useModal } from "@/components/shared/modal/useModal";
import PopupFormModal from "@/components/features/popup/popup-form-modal";

interface PopupSearchFormProps {
  className?: string;
  onRefresh: () => void;
}

function PopupSearchForm({ className, onRefresh }: PopupSearchFormProps) {
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
        팝업 추가하기
      </Button>
      <PopupFormModal
        isOpen={modal.isOpen}
        onClose={modal.close}
        onSubmit={() => {
          onRefresh();
        }}
      />
    </div>
  );
}

export default PopupSearchForm;
