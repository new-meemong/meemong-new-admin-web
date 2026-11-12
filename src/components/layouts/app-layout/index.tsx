"use client";

import React, { useCallback } from "react";

import { Button } from "@/components/ui/button";
import IcBannerMenu from "@/assets/icons/ic_banner_menu.svg";
import IcContentsMenu from "@/assets/icons/ic_contents_menu.svg";
import IcPopupMenu from "@/assets/icons/ic_popup_menu.svg";
import IcReportMenu from "@/assets/icons/ic_report_menu.svg";
import IcUserMenu from "@/assets/icons/ic_user_menu.svg";
import { Coins, LayoutDashboard, MessagesSquare, Package } from "lucide-react";
import { signOutSupportAdmin } from "@/lib/firebase/support-chat";
import { useSupportChatUnreadRoomCount } from "@/components/features/support-chat/use-support-chat-unread-room-count";
import SideNav from "@/components/layouts/app-layout/side-nav";
import SideNavItem from "@/components/layouts/app-layout/side-nav/side-nav-item";
import SideNavGroup from "@/components/layouts/app-layout/side-nav/side-nav-group";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface DefaultLayoutProps {
  children: React.ReactNode;
  className?: string;
}

function AppLayout({ children, className }: DefaultLayoutProps) {
  const router = useRouter();

  const supportChatUnreadRooms = useSupportChatUnreadRoomCount();

  const handleLogout = useCallback(() => {
    // 세션 스토리지 클리어
    sessionStorage.removeItem("adminName");
    sessionStorage.removeItem("adminPassword");

    // 쿠키 삭제
    document.cookie = "accessToken=; path=/; max-age=0";
    // 운영팀 채팅 Firebase 운영자 세션도 어드민 로그인과 함께 끝낸다.
    void signOutSupportAdmin();

    // 로그인 페이지로 리다이렉트
    router.push("/login");
  }, [router]);

  return (
    <div
      className={cn(
        "app-layout flex min-h-screen flex-col md:flex-row",
        className,
      )}
    >
      <SideNav>
        <SideNavItem
          href={"/dashboard"}
          icon={<LayoutDashboard className="h-4 w-4" />}
          label={"대시보드"}
        />
        <SideNavItem href={"/user"} icon={<IcUserMenu />} label={"회원 관리"} />
        <SideNavItem
          href={"/user-files"}
          icon={<IcContentsMenu />}
          label={"이미지 관리"}
        />
        <SideNavItem
          href={"/contents"}
          icon={<IcContentsMenu />}
          label={"콘텐츠 관리"}
        />
        <SideNavItem
          href={"/reports"}
          icon={<IcReportMenu />}
          label={"신고 관리"}
        />
        <SideNavGroup
          icon={<MessagesSquare className="h-4 w-4" />}
          label={"상담 관리"}
          items={[
            { href: "/support-chat", label: "상담함", badgeCount: supportChatUnreadRooms },
            { href: "/support-chat-faq", label: "챗봇 FAQ" },
          ]}
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
          href={"/salon-pick-products"}
          icon={<Package className="h-4 w-4" />}
          label={"상품 관리"}
        />
        <SideNavItem
          href={"/mong-money-deposits"}
          icon={<Coins className="h-4 w-4" />}
          label={"몽지급 관리"}
        />
        <SideNavItem
          href={"/brand"}
          icon={<IcBannerMenu />}
          label={"브랜드 관리"}
        />
        <div className="mt-auto pt-4">
          <Button
            variant="outline"
            onClick={handleLogout}
            className={cn(
              "h-11 w-full justify-start rounded-lg border-[#dcdcdc] px-5 text-[15px] font-normal text-[#444444]",
              "hover:bg-muted-foreground/10",
            )}
          >
            로그아웃
          </Button>
        </div>
      </SideNav>
      <main className="min-w-0 flex-1 overflow-auto bg-background">
        {children}
      </main>
    </div>
  );
}

export default AppLayout;
