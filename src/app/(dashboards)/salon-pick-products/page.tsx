import React from "react";
import {
  DashboardPageLayout,
  DashboardPageLayoutBody,
  DashboardPageLayoutHeader,
} from "@/components/layouts/dashboard-page-layout";
import SalonPickProductsPageContent from "@/components/features/salon-pick-products/salon-pick-products-page-content";

export default function SalonPickProductsPage() {
  return (
    <DashboardPageLayout>
      <DashboardPageLayoutHeader title="상품 관리" className="mb-[20px]" />
      <DashboardPageLayoutBody>
        <SalonPickProductsPageContent />
      </DashboardPageLayoutBody>
    </DashboardPageLayout>
  );
}
