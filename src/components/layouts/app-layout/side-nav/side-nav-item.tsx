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
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center mx-[4px] mt-[4px] rounded-6 gap-[12px] px-[20px] py-[16px] transition-colors duration-300",
        isActive
          ? "text-primary-foreground bg-primary-background typo-body-2-long-bold"
          : "hover:bg-muted-foreground/10 text-foreground typo-body-2-long-semibold",
        className,
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

export default SideNavItem;
