"use client";

import React from "react";
import { cn } from "@/lib/utils";
import SideNav from "@/components/layouts/app-layout/side-nav";
import SideNavItem from "@/components/layouts/app-layout/side-nav/side-nav-item";

import IcUserMenu from "@/assets/icons/ic_user_menu.svg";
import IcContentsMenu from "@/assets/icons/ic_contents_menu.svg";
import IcReportMenu from "@/assets/icons/ic_report_menu.svg";
import IcBannerMenu from "@/assets/icons/ic_banner_menu.svg";

interface DefaultLayoutProps {
  children: React.ReactNode;
  className?: string;
}

function AppLayout({ children, className }: DefaultLayoutProps) {
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
          href={"/report"}
          icon={<IcReportMenu />}
          label={"신고 관리"}
        />
        <SideNavItem
          href={"/banner"}
          icon={<IcBannerMenu />}
          label={"배너 관리"}
        />
      </SideNav>
      <main className="flex-1 overflow-auto bg-background">{children}</main>
    </div>
  );
}

export default AppLayout;
