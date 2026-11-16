"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

interface SideNavProps {
  children: React.ReactNode;
  /** 데스크톱 사이드바에만 적용하며 모바일 드로어에는 적용하지 않습니다. */
  className?: string;
  /** 통합 대시보드는 모든 화면 크기에서 상단 바와 드로어를 사용합니다. */
  drawerOnly?: boolean;
}

function SideNav({ children, className, drawerOnly = false }: SideNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (drawerOnly) return;
    const desktop = window.matchMedia("(min-width: 768px)");
    const closeOnDesktop = () => {
      if (desktop.matches) setOpen(false);
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, [drawerOnly]);

  return (
    <>
      {!drawerOnly && (
        <nav
          aria-label="어드민 메뉴"
          className={cn(
            "hidden md:flex flex-col gap-0.5 w-[232px] shrink-0 min-h-screen bg-background border-r border-[#e8e8e8] px-2.5 pt-5 pb-4",
            className,
          )}
        >
          {children}
        </nav>
      )}
      <Drawer direction="left" open={open} onOpenChange={setOpen}>
        <header
          className={cn(
            "flex items-center border-b bg-background",
            drawerOnly
              ? "h-[53px] shrink-0 gap-[14px] border-[#e5e5e7] px-6"
              : "gap-3 px-4 py-2 md:hidden",
          )}
        >
          <DrawerTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="메뉴 열기"
              className={drawerOnly ? "h-5 w-5 rounded-none" : undefined}
            >
              {drawerOnly ? (
                <Image
                  src="/dashboard/menu.svg"
                  width={20}
                  height={20}
                  alt=""
                />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </DrawerTrigger>
          <span
            className={cn(
              "font-semibold",
              drawerOnly && "text-[14px] leading-[17px] text-[#1d1d1f]",
            )}
          >
            미몽 어드민
          </span>
        </header>
        <DrawerPortal>
          <DrawerOverlay />
          <DrawerContent
            className="pointer-events-auto w-[280px] max-w-[85vw] h-dvh"
            aria-describedby={undefined}
          >
            <DrawerHeader className="flex-row items-center justify-between border-b">
              <DrawerTitle className="font-semibold">어드민 메뉴</DrawerTitle>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon" aria-label="메뉴 닫기">
                  <X className="h-5 w-5" />
                </Button>
              </DrawerClose>
            </DrawerHeader>
            <nav
              aria-label="어드민 메뉴"
              className="flex min-h-0 flex-1 flex-col overflow-y-auto"
              onClick={(event) => {
                if ((event.target as HTMLElement).closest("a")) setOpen(false);
              }}
            >
              {children}
            </nav>
          </DrawerContent>
        </DrawerPortal>
      </Drawer>
    </>
  );
}

export default SideNav;
