"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface SideNavGroupProps {
  icon?: React.ReactNode;
  label: string;
  items: { href: string; label: string; badgeCount?: number }[];
}

/** 프로토타입의 접히는 메뉴 묶음(예: 상담 관리). 하위 메뉴는 점·굵기로 현재 위치를 표시한다. */
function SideNavGroup({ icon, label, items }: SideNavGroupProps) {
  const pathname = usePathname();
  const active = items.some((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
  const [open, setOpen] = useState(true);

  return (
    <div className="flex flex-col">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "flex h-[46px] items-center gap-[14px] rounded-lg px-4 text-[15px] tracking-[-0.3px]",
          active ? "bg-[#c8c2dd] font-semibold text-[#5a4b8a]" : "font-medium text-[#4a4a4a] hover:bg-muted-foreground/10",
        )}
      >
        {icon}
        <span>{label}</span>
        {open ? <ChevronUp className="ml-auto size-4" aria-hidden /> : <ChevronDown className="ml-auto size-4" aria-hidden />}
      </button>
      {open && (
        <div className="flex flex-col pb-1.5 pt-1">
          {items.map((item) => {
            const current = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-9 items-center gap-[15px] pl-[22px] pr-4 text-[14px] tracking-[-0.3px]",
                  current ? "font-bold text-[#5a4b8a]" : "font-medium text-[#6b6b6b]",
                )}
              >
                <span className={cn("size-[5px] flex-none rounded-full", current ? "bg-[#5a4b8a]" : "bg-transparent")} />
                <span>{item.label}</span>
                {(item.badgeCount ?? 0) > 0 && (
                  <span
                    aria-label={`안 읽은 채팅방 ${item.badgeCount}개`}
                    className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-[#e5484d] px-1.5 text-[11px] font-bold text-white"
                  >
                    {item.badgeCount! > 99 ? "99+" : item.badgeCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default SideNavGroup;
