import React from "react";
import {
  DashboardPageLayout,
  DashboardPageLayoutBody,
  DashboardPageLayoutHeader,
} from "@/components/layouts/dashboard-page-layout";
import MongMoneyDepositManagementPageContent from "@/components/features/mong-moneys/mong-money-deposit-management-page-content";

export default function MongMoneyDepositsPage() {
  return (
    <DashboardPageLayout>
      <DashboardPageLayoutHeader
        title="몽지급 관리"
        className="mb-[20px]"
      />
      <DashboardPageLayoutBody>
        <MongMoneyDepositManagementPageContent />
      </DashboardPageLayoutBody>
    </DashboardPageLayout>
  );
}
