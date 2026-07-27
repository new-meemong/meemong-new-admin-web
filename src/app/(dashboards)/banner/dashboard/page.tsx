import React, { Suspense } from "react";
import {
  DashboardPageLayout,
  DashboardPageLayoutBody,
  DashboardPageLayoutHeader,
} from "@/components/layouts/dashboard-page-layout";
import { BannerProvider } from "@/components/contexts/banner-context";
import BannerTab from "@/components/features/banner/banner-tab";
import BannerClickDashboard from "@/components/features/banner/banner-click-dashboard";

export default function BannerDashboardPage() {
  return (
    <Suspense>
      <BannerProvider>
        <DashboardPageLayout>
          <DashboardPageLayoutHeader title="배너 클릭 대시보드">
            <BannerTab mode="dashboard" />
          </DashboardPageLayoutHeader>
          <DashboardPageLayoutBody>
            <BannerClickDashboard />
          </DashboardPageLayoutBody>
        </DashboardPageLayout>
      </BannerProvider>
    </Suspense>
  );
}
