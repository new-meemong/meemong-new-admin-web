"use client";

import React, { useCallback } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import SideNav from "@/components/layouts/app-layout/side-nav";
import SideNavItem from "@/components/layouts/app-layout/side-nav/side-nav-item";
import { Button } from "@/components/ui/button";

import IcUserMenu from "@/assets/icons/ic_user_menu.svg";
import IcContentsMenu from "@/assets/icons/ic_contents_menu.svg";
import IcReportMenu from "@/assets/icons/ic_report_menu.svg";
import IcBannerMenu from "@/assets/icons/ic_banner_menu.svg";
import IcPopupMenu from "@/assets/icons/ic_popup_menu.svg";

interface DefaultLayoutProps {
  children: React.ReactNode;
  className?: string;
}

function AppLayout({ children, className }: DefaultLayoutProps) {
  const router = useRouter();

  const handleLogout = useCallback(() => {
    // 세션 스토리지 클리어
    sessionStorage.removeItem("adminName");
    sessionStorage.removeItem("adminPassword");

    // 쿠키 삭제
    document.cookie = "accessToken=; path=/; max-age=0";

    // 로그인 페이지로 리다이렉트
    router.push("/login");
  }, [router]);

  return (
    <div className={cn("app-layout flex min-h-screen", className)}>
      <SideNav>
        <SideNavItem href={"/user"} icon={<IcUserMenu />} label={"회원 관리"} />
        <SideNavItem
          href={"/contents"}
          icon={<IcContentsMenu />}
          label={"컨텐츠 관리"}
        />
        <SideNavItem
          href={"/declaration"}
          icon={<IcReportMenu />}
          label={"신고 관리"}
        />
        <SideNavItem
          href={"/banner"}
          icon={<IcBannerMenu />}
          label={"배너 관리"}
        />
        <SideNavItem
          href={"/popup"}
          icon={<IcPopupMenu />}
          label={"팝업 관리"}
        />
        <SideNavItem
          href={"/brand"}
          icon={<IcBannerMenu />}
          label={"브랜드 관리"}
        />
        <div className="mt-auto mb-4 px-[4px]">
          <Button
            variant="outline"
            onClick={handleLogout}
            className={cn(
              "w-full rounded-6 gap-[12px] px-[20px] py-[16px] justify-start",
              "hover:bg-muted-foreground/10 text-foreground typo-body-2-long-semibold",
              "border-border"
            )}
          >
            로그아웃
          </Button>
        </div>
      </SideNav>
      <main className="flex-1 overflow-auto bg-background">{children}</main>
    </div>
  );
}

export default AppLayout;
