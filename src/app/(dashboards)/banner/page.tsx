import React from "react";
import {
  DashboardPageLayout,
  DashboardPageLayoutBody,
  DashboardPageLayoutHeader,
} from "@/components/layouts/dashboard-page-layout";
import BannerPageContent from "@/components/features/banner/banner-page-content";

export default function BannerPage() {
  return (
    <DashboardPageLayout>
      <DashboardPageLayoutHeader title={"배너 관리"} />
      <DashboardPageLayoutBody>
        <BannerPageContent />
      </DashboardPageLayoutBody>
    </DashboardPageLayout>
  );
}
