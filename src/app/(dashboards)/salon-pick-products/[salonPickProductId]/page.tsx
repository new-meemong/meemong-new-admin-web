import React from "react";
import {
  DashboardPageLayout,
  DashboardPageLayoutBody,
  DashboardPageLayoutHeader,
} from "@/components/layouts/dashboard-page-layout";
import SalonPickProductDetailPageContent from "@/components/features/salon-pick-products/salon-pick-product-detail-page-content";

export default function SalonPickProductDetailPage() {
  return (
    <DashboardPageLayout>
      <DashboardPageLayoutHeader
        title="상품 관리 > 상품 내용 상세"
        className="mb-[20px]"
      />
      <DashboardPageLayoutBody>
        <SalonPickProductDetailPageContent />
      </DashboardPageLayoutBody>
    </DashboardPageLayout>
  );
}
