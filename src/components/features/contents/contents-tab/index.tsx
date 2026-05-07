"use client";

import { ContentsCategoryType } from "@/models/contents";
import DashboardHeaderTabGroup from "@/components/shared/dashboard-header-tab-group";
import React from "react";
import { useContentsContext } from "@/components/contexts/contents-context";

interface ContentsTabProps {
  className?: string;
}

function ContentsTab({ className, ...props }: ContentsTabProps) {
  const { tabId, setTabId } = useContentsContext();

  const CATEGORY_TYPE_OPTIONS: {
    value: ContentsCategoryType;
    label: string;
  }[] = [
    { value: "0", label: "빠른/일반" },
    { value: "1", label: "빠른/프리미엄" },
    { value: "2", label: "구인공고" },
    { value: "3", label: "이력서" },
    { value: "4", label: "모집공고" },
    { value: "5", label: "샴푸실" },
    { value: "6", label: "헤어컨설팅" },
  ];

  return (
    <DashboardHeaderTabGroup<ContentsCategoryType>
      className={className}
      options={CATEGORY_TYPE_OPTIONS}
      value={tabId as ContentsCategoryType}
      onChange={setTabId}
      {...props}
    />
  );
}

export default ContentsTab;
