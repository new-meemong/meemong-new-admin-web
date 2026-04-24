"use client";

import { cn } from "@/lib/utils";
import SwitchButton from "@/components/shared/switch-button";

export type ImageManagementTabType = "USER_FILES" | "BEAUTY_APPLICATION_IMAGES";

interface ImageManagementTabProps {
  value: ImageManagementTabType;
  onChange: (value: ImageManagementTabType) => void;
  className?: string;
}

const IMAGE_MANAGEMENT_TAB_OPTIONS: {
  label: string;
  value: ImageManagementTabType;
}[] = [
  { label: "회원이미지", value: "USER_FILES" },
  { label: "모집공고이미지", value: "BEAUTY_APPLICATION_IMAGES" }
];

function ImageManagementTab({
  value,
  onChange,
  className
}: ImageManagementTabProps) {
  return (
    <SwitchButton<ImageManagementTabType>
      className={cn(className)}
      options={IMAGE_MANAGEMENT_TAB_OPTIONS}
      value={value}
      onChange={onChange}
    />
  );
}

export default ImageManagementTab;
