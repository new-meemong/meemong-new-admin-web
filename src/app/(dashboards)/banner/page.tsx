import React, { Suspense } from "react";
import {
  DashboardPageLayout,
  DashboardPageLayoutBody,
  DashboardPageLayoutHeader,
} from "@/components/layouts/dashboard-page-layout";
import BannerPageContent from "@/components/features/banner/banner-page-content";
import { BannerProvider } from "@/components/contexts/banner-context";
import BannerTab from "@/components/features/banner/banner-tab";

export default function BannerPage() {
  return (
    <Suspense>
      <BannerProvider>
        <DashboardPageLayout>
          <DashboardPageLayoutHeader title={"배너 관리"} className="mb-[12px]">
            <BannerTab />
          </DashboardPageLayoutHeader>
          <DashboardPageLayoutBody>
            <BannerPageContent />
          </DashboardPageLayoutBody>
        </DashboardPageLayout>
      </BannerProvider>
    </Suspense>
  );
}
