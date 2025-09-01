"use client";

import React from "react";
import { cn } from "@/lib/utils";
import SideNav from "@/components/layouts/app-layout/side-nav";
import SideNavItem from "@/components/layouts/app-layout/side-nav/side-nav-item";

import IcUserMenu from "@/assets/icons/ic_user_menu.svg";
import IcContentsMenu from "@/assets/icons/ic_contents_menu.svg";
import IcReportMenu from "@/assets/icons/ic_report_menu.svg";
import IcBannerMenu from "@/assets/icons/ic_banner_menu.svg";
import IcPushMenu from "@/assets/icons/ic_push_menu.svg";

interface DefaultLayoutProps {
  children: React.ReactNode;
  className?: string;
}

function AppLayout({ children, className }: DefaultLayoutProps) {
  const sideNavList: { href: string; icon: React.ReactNode; label: string }[] =
    [
      { href: "/user", icon: <IcUserMenu />, label: "회원 관리" },
      { href: "/contents", icon: <IcContentsMenu />, label: "컨텐츠 관리" },
      { href: "/declaration", icon: <IcReportMenu />, label: "신고 관리" },
      { href: "/banner", icon: <IcBannerMenu />, label: "배너 관리" },
      { href: "/push", icon: <IcPushMenu />, label: "푸시알림" },
    ];

  return (
    <div className={cn("app-layout flex min-h-screen", className)}>
      <SideNav>
        {sideNavList.map(({ href, icon, label }, index) => (
          <SideNavItem
            key={`side-nav-item-${index}`}
            href={href}
            icon={icon}
            label={label}
          />
        ))}
      </SideNav>
      <main className="flex-1 overflow-auto bg-background">{children}</main>
    </div>
  );
}

export default AppLayout;
