"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface DashboardPageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

function DashboardPageLayout({
  children,
  className,
}: DashboardPageLayoutProps) {
  return (
    <div
      className={cn(
        "admin-page-layout w-full min-w-[1036px] px-[36px] py-[54px]",
        className,
      )}
    >
      {children}
    </div>
  );
}

const DashboardPageLayoutHeader = ({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) => (
  <h1
    className={cn(
      "admin-page-layout-header typo-title-1-bold text-black mb-[16px] flex flex-row gap-[20px]",
    )}
  >
    {title}
    {children}
  </h1>
);

const DashboardPageLayoutSearch = ({
  children,
  className,
}: DashboardPageLayoutProps) => (
  <div
    className={cn(
      "admin-page-layout-search w-full h-[36px] mb-[42px]",
      className,
    )}
  >
    <div
      className={cn(
        "w-full h-full max-w-[1038px] flex items-center justify-between",
      )}
    >
      {children}
    </div>
  </div>
);

const DashboardPageLayoutBody = ({
  children,
  className,
}: DashboardPageLayoutProps) => (
  <div className={cn("admin-page-layout-body w-full", className)}>
    {children}
  </div>
);

export {
  DashboardPageLayout,
  DashboardPageLayoutHeader,
  DashboardPageLayoutSearch,
  DashboardPageLayoutBody,
};
