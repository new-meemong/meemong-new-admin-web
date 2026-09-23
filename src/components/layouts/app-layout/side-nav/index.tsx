"use client";

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
}

function SideNav({ children, className }: SideNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 768px)");
    const closeOnDesktop = () => {
      if (desktop.matches) setOpen(false);
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  return (
    <>
      <nav
        aria-label="어드민 메뉴"
        className={cn(
          "hidden md:flex flex-col w-[162px] shrink-0 min-h-screen bg-background border-r border-border-alternative shadow-sidenav",
          className,
        )}
      >
        {children}
      </nav>
      <Drawer direction="left" open={open} onOpenChange={setOpen}>
        <header className="flex items-center gap-3 border-b bg-background px-4 py-2 md:hidden">
          <DrawerTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="메뉴 열기">
              <Menu className="h-5 w-5" />
            </Button>
          </DrawerTrigger>
          <span className="font-semibold">미몽 어드민</span>
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
