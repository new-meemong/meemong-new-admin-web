import React, { Suspense } from "react";
import {
  DashboardPageLayout,
  DashboardPageLayoutBody,
  DashboardPageLayoutHeader,
} from "@/components/layouts/dashboard-page-layout";
import BrandPageContent from "@/components/features/brand/brand-page-content";

export default function BrandPage() {
  return (
    <Suspense>
      <DashboardPageLayout>
        <DashboardPageLayoutHeader title={"브랜드 관리"} className="mb-[12px]">
        </DashboardPageLayoutHeader>
        <DashboardPageLayoutBody>
          <BrandPageContent />
        </DashboardPageLayoutBody>
      </DashboardPageLayout>
    </Suspense>
  );
}


