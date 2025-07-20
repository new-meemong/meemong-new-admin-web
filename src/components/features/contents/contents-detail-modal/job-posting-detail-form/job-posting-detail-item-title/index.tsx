"use client";

import React from "react";
import { IJobPostingForm } from "@/models/jobPostings";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/date";

interface JobPostingDetailItemTitleProps {
  jobPosting: IJobPostingForm;
}

export default function JobPostingDetailItemTitle({
  jobPosting,
}: JobPostingDetailItemTitleProps) {
  return (
    <div className={cn("w-full flex flex-col gap-[10px]")}>
      <div className={cn("w-full truncate")}>{jobPosting.postingTitle}</div>
      <div className={cn("w-full flex flex-row gap-2")}>
        <span>{jobPosting.role || "-"}</span>
        <span>|</span>
        <span className={cn("truncate")}>
          {jobPosting.postingRegions || "-"}
        </span>
        <span>|</span>
        <span>
          {jobPosting.createdAt
            ? formatDate(jobPosting.createdAt, "YYYY.MM.DD")
            : "-"}
        </span>
      </div>
    </div>
  );
}
