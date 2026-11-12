"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface SideNavItemProps {
  href: string;
  icon?: React.ReactNode;
  label: string;
  className?: string;
}

function SideNavItem({ href, icon, label, className }: SideNavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      // 크기·색은 어드민 프로토타입 사이드바(높이 46, 15px, 활성 #c8c2dd/#5a4b8a)를 따른다.
      className={cn(
        "flex h-[46px] items-center gap-[14px] rounded-lg px-4 text-[15px] tracking-[-0.3px] transition-colors duration-300",
        isActive
          ? "bg-[#c8c2dd] font-semibold text-[#5a4b8a]"
          : "font-medium text-[#4a4a4a] hover:bg-muted-foreground/10",
        className,
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

export default SideNavItem;
