"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SideNavProps {
  children: React.ReactNode;
  className?: string;
}

function SideNav({ children, className }: SideNavProps) {
  return (
    <div
      className={cn(
        "flex flex-col w-[162px] min-h-screen bg-background border-r border-border-alternative shadow-sidenav",
        className,
      )}
    >
      {children}
    </div>
  );
}

export default SideNav;
