"use client";

import React from "react";
import { IResumeForm } from "@/models/resumes";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/date";

interface ResumeDetailItemTitleProps {
  resume: IResumeForm;
}

export default function ResumeDetailItemTitle({
  resume,
}: ResumeDetailItemTitleProps) {
  return (
    <div className={cn("w-full flex flex-col gap-[10px]")}>
      <div className={cn("w-full truncate")}>{resume.shortDescription}</div>
      <div className={cn("w-full flex flex-row gap-2")}>
        <span>{resume.appliedRole || "-"}</span>
        <span>|</span>
        <span className={cn("truncate")}>
          {resume.preferredStoreRegions || "-"}
        </span>
        <span>|</span>
        <span>
          {resume.createdAt
            ? formatDate(resume.createdAt, "YYYY.MM.DD")
            : "-"}
        </span>
      </div>
    </div>
  );
}
