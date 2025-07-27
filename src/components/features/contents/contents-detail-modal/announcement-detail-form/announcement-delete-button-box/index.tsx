"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface AnnouncementDeleteButtonBoxProps {
  onClick: () => void;
}

export default function AnnouncementDeleteButtonBox({
  onClick,
}: AnnouncementDeleteButtonBoxProps) {
  return (
    <div className={cn("ml-2")}>
      <Button variant={"outline"} onClick={onClick}>
        삭제
      </Button>
    </div>
  );
}
